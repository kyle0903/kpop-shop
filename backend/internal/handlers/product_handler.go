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

// CreateProduct 建立商品
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.repo.Create(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// UpdateProduct 更新商品
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.repo.Update(id, &req)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// DeleteProduct 刪除商品
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// CreateVersion 建立商品版本
func (h *ProductHandler) CreateVersion(c *gin.Context) {
	productID := c.Param("id")

	var req models.CreateVersionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	version, err := h.repo.CreateVersion(productID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, version)
}

// UpdateVersion 更新商品版本
func (h *ProductHandler) UpdateVersion(c *gin.Context) {
	productID := c.Param("id")
	versionID := c.Param("versionId")

	var req models.UpdateVersionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	version, err := h.repo.UpdateVersion(productID, versionID, &req)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Version not found"})
		return
	}

	c.JSON(http.StatusOK, version)
}

// DeleteVersion 刪除商品版本
func (h *ProductHandler) DeleteVersion(c *gin.Context) {
	productID := c.Param("id")
	versionID := c.Param("versionId")

	if err := h.repo.DeleteVersion(productID, versionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Version deleted successfully"})
}
