package handlers

import (
	"log"
	"net/http"
	"time"

	"kpop-shop/internal/models"
	"kpop-shop/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// OrderHandler 訂單處理器
type OrderHandler struct {
	orderRepo *repository.OrderRepository
	cartRepo  *repository.CartRepository
}

// NewOrderHandler 建立訂單處理器
func NewOrderHandler(orderRepo *repository.OrderRepository, cartRepo *repository.CartRepository) *OrderHandler {
	return &OrderHandler{
		orderRepo: orderRepo,
		cartRepo:  cartRepo,
	}
}

// CreateOrder 建立新訂單
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	// 1. 綁定請求資料
	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. 取得購物車
	cartID, err := c.Cookie("cart_id")
	if err != nil || cartID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}
	cart := h.cartRepo.GetOrCreate(cartID)

	if len(cart.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	// 3. 轉換購物車項目為訂單項目
	var orderItems []models.OrderItem
	var subtotal float64
	orderID := uuid.New().String()

	for _, item := range cart.Items {
		orderItem := models.OrderItem{
			ID:          uuid.New().String(),
			OrderID:     orderID,
			ProductID:   item.ProductID,
			ProductName: item.ProductName,
			Artist:      item.Artist,
			VersionID:   item.VersionID,
			VersionName: item.VersionName,
			Price:       item.Price,
			Quantity:    item.Quantity,
			Subtotal:    item.Price * float64(item.Quantity),
			ImageURL:    item.ImageURL,
		}
		orderItems = append(orderItems, orderItem)
		subtotal += orderItem.Subtotal
	}

	// 4. 計算運費與總金額
	shippingFee := 80.0
	if subtotal >= 1500 {
		shippingFee = 0 // 滿 1500 免運
	}

	total := subtotal + shippingFee

	// 5. 建立訂單物件
	order := models.Order{
		ID:            orderID,
		OrderNumber:   generateOrderNumber(),
		Items:         orderItems,
		Subtotal:      subtotal,
		ShippingFee:   shippingFee,
		Total:         total,
		Status:        models.OrderStatusPending,
		ShippingInfo:  req.ShippingInfo,
		PaymentMethod: req.PaymentMethod,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// 6. 儲存到資料庫
	if err := h.orderRepo.Create(&order); err != nil {
		log.Printf("Failed to create order: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// 7. 清空購物車
	h.cartRepo.Clear(cartID)

	c.JSON(http.StatusCreated, order)
}

// 產生訂單編號 (格式: ORD-YYYYMMDD-Random)
func generateOrderNumber() string {
	return "ORD-" + time.Now().Format("20060102") + "-" + uuid.New().String()[:8]
}
