package handlers

import (
	"net/http"

	"kpop-shop/internal/models"
	"kpop-shop/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CartHandler 購物車處理器
type CartHandler struct {
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
}

// NewCartHandler 建立購物車處理器
func NewCartHandler(cartRepo *repository.CartRepository, productRepo *repository.ProductRepository) *CartHandler {
	return &CartHandler{
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

// getCartID 取得購物車 ID（從 cookie 或產生新的）
func (h *CartHandler) getCartID(c *gin.Context) string {
	cartID, err := c.Cookie("cart_id")
	if err != nil || cartID == "" {
		cartID = uuid.New().String()
		c.SetCookie("cart_id", cartID, 60*60*24*30, "/", "", false, false)
	}
	return cartID
}

// GetCart 取得購物車
func (h *CartHandler) GetCart(c *gin.Context) {
	cartID := h.getCartID(c)
	cart := h.cartRepo.GetOrCreate(cartID)
	c.JSON(http.StatusOK, cart)
}

// AddToCart 新增商品到購物車
func (h *CartHandler) AddToCart(c *gin.Context) {
	var req models.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 取得商品資訊
	product, ok := h.productRepo.GetByID(req.ProductID)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// 找到對應版本
	var version *models.ProductVersion
	for _, v := range product.Versions {
		if v.ID == req.VersionID {
			version = &v
			break
		}
	}
	if version == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Version not found"})
		return
	}

	cartID := h.getCartID(c)
	item := models.CartItem{
		ProductID:   product.ID,
		ProductName: product.Name,
		Artist:      product.Artist,
		VersionID:   version.ID,
		VersionName: version.Name,
		Price:       version.Price,
		Quantity:    req.Quantity,
		ImageURL:    product.ImageURL,
	}

	cart := h.cartRepo.AddItem(cartID, item)
	c.JSON(http.StatusOK, cart)
}

// UpdateCartItem 更新購物車項目
func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	itemID := c.Param("id")
	var req models.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cartID := h.getCartID(c)
	cart := h.cartRepo.UpdateItem(cartID, itemID, req.Quantity)
	if cart == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}
	c.JSON(http.StatusOK, cart)
}

// RemoveCartItem 移除購物車項目
func (h *CartHandler) RemoveCartItem(c *gin.Context) {
	itemID := c.Param("id")
	cartID := h.getCartID(c)
	cart := h.cartRepo.RemoveItem(cartID, itemID)
	if cart == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}
	c.JSON(http.StatusOK, cart)
}

// ClearCart 清空購物車
func (h *CartHandler) ClearCart(c *gin.Context) {
	cartID := h.getCartID(c)
	h.cartRepo.Clear(cartID)
	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
}
