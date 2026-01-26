package repository

import (
	"sync"
	"time"

	"kpop-shop/internal/models"

	"github.com/google/uuid"
)

// CartRepository 購物車資料庫
type CartRepository struct {
	carts map[string]*models.Cart
	mu    sync.RWMutex
}

// NewCartRepository 建立購物車資料庫實例
func NewCartRepository() *CartRepository {
	return &CartRepository{
		carts: make(map[string]*models.Cart),
	}
}

// GetOrCreate 取得或建立購物車
func (r *CartRepository) GetOrCreate(cartID string) *models.Cart {
	r.mu.Lock()
	defer r.mu.Unlock()

	if cart, ok := r.carts[cartID]; ok {
		return cart
	}

	cart := &models.Cart{
		ID:        cartID,
		Items:     []models.CartItem{},
		Total:     0,
		ItemCount: 0,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	r.carts[cartID] = cart
	return cart
}

// AddItem 新增商品到購物車
func (r *CartRepository) AddItem(cartID string, item models.CartItem) *models.Cart {
	r.mu.Lock()
	defer r.mu.Unlock()

	cart := r.carts[cartID]
	if cart == nil {
		cart = &models.Cart{
			ID:        cartID,
			Items:     []models.CartItem{},
			CreatedAt: time.Now().UTC(),
		}
		r.carts[cartID] = cart
	}

	// 檢查是否已有相同商品版本
	found := false
	for i, existingItem := range cart.Items {
		if existingItem.ProductID == item.ProductID && existingItem.VersionID == item.VersionID {
			cart.Items[i].Quantity += item.Quantity
			cart.Items[i].Subtotal = cart.Items[i].Price * float64(cart.Items[i].Quantity)
			found = true
			break
		}
	}

	if !found {
		item.ID = uuid.New().String()
		item.Subtotal = item.Price * float64(item.Quantity)
		cart.Items = append(cart.Items, item)
	}

	r.recalculateCart(cart)
	return cart
}

// UpdateItem 更新購物車項目
func (r *CartRepository) UpdateItem(cartID, itemID string, quantity int) *models.Cart {
	r.mu.Lock()
	defer r.mu.Unlock()

	cart := r.carts[cartID]
	if cart == nil {
		return nil
	}

	if quantity <= 0 {
		// 移除項目
		for i, item := range cart.Items {
			if item.ID == itemID {
				cart.Items = append(cart.Items[:i], cart.Items[i+1:]...)
				break
			}
		}
	} else {
		// 更新數量
		for i, item := range cart.Items {
			if item.ID == itemID {
				cart.Items[i].Quantity = quantity
				cart.Items[i].Subtotal = cart.Items[i].Price * float64(quantity)
				break
			}
		}
	}

	r.recalculateCart(cart)
	return cart
}

// RemoveItem 移除購物車項目
func (r *CartRepository) RemoveItem(cartID, itemID string) *models.Cart {
	return r.UpdateItem(cartID, itemID, 0)
}

// Clear 清空購物車
func (r *CartRepository) Clear(cartID string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if cart, ok := r.carts[cartID]; ok {
		cart.Items = []models.CartItem{}
		cart.Total = 0
		cart.ItemCount = 0
		cart.UpdatedAt = time.Now().UTC()
	}
}

func (r *CartRepository) recalculateCart(cart *models.Cart) {
	var total float64
	var itemCount int

	for _, item := range cart.Items {
		total += item.Subtotal
		itemCount += item.Quantity
	}

	cart.Total = total
	cart.ItemCount = itemCount
	cart.UpdatedAt = time.Now().UTC()
}
