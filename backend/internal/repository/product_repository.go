package repository

import (
	"kpop-shop/internal/models"

	"gorm.io/gorm"
)

// ProductRepository 商品資料庫
type ProductRepository struct{
	db *gorm.DB
}

// NewProductRepository 建立商品資料庫實例
func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// GetAll 取得所有商品
func (r *ProductRepository) GetAll(filter models.ProductFilter) models.ProductListResponse {
	var products []models.Product
	query := r.db.Preload("Versions")

	// 分類篩選
	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}
	// 藝人篩選
	if filter.Artist != "" {
		query = query.Where("artist = ?", filter.Artist)
	}
	// 搜尋
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("name ILIKE ? OR artist ILIKE ?", searchPattern, searchPattern)
	}

	// 計算總數
	var total int64
	query.Model(&models.Product{}).Count(&total)

	// 分頁
	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 12
	}

	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&products)

	return models.ProductListResponse{
		Products:   products,
		Total:      int(total),
		Page:       page,
		PageSize:   pageSize,
		TotalPages: (int(total) + pageSize - 1) / pageSize,
	}
}

// GetByID 取得單一商品
func (r *ProductRepository) GetByID(id string) (*models.Product, bool) {
	var product models.Product
	result := r.db.Preload("Versions").First(&product, "id = ?", id)
	if result.Error != nil {
		return nil, false
	}
	return &product, true
}

// GetCategories 取得所有分類
func (r *ProductRepository) GetCategories() []map[string]interface{} {
	return []map[string]interface{}{
		{"id": "album", "name": "專輯", "name_en": "Albums"},
		{"id": "merchandise", "name": "周邊", "name_en": "Merchandise"},
		{"id": "preorder", "name": "預購", "name_en": "Pre-order"},
	}
}

// GetArtists 取得所有藝人
func (r *ProductRepository) GetArtists() []string {
	var artists []string
	r.db.Model(&models.Product{}).Distinct("artist").Pluck("artist", &artists)
	return artists
}
