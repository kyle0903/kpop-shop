package handlers

import (
	"net/http"

	"kpop-shop/internal/models"
	"kpop-shop/internal/repository"

	"github.com/gin-gonic/gin"
)

// ProductHandler 商品處理器
type ProductHandler struct {
	repo *repository.ProductRepository
}

// NewProductHandler 建立商品處理器
func NewProductHandler(repo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{repo: repo}
}

// GetProducts 取得商品列表
func (h *ProductHandler) GetProducts(c *gin.Context) {
	var filter models.ProductFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := h.repo.GetAll(filter)
	c.JSON(http.StatusOK, result)
}

// GetProduct 取得單一商品
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	product, ok := h.repo.GetByID(id)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(http.StatusOK, product)
}

// GetCategories 取得所有分類
func (h *ProductHandler) GetCategories(c *gin.Context) {
	categories := h.repo.GetCategories()
	c.JSON(http.StatusOK, categories)
}

// GetArtists 取得所有藝人
func (h *ProductHandler) GetArtists(c *gin.Context) {
	artists := h.repo.GetArtists()
	c.JSON(http.StatusOK, artists)
}
