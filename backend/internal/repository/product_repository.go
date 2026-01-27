package repository

import (
	"strings"
	"time"

	"kpop-shop/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProductRepository 商品資料庫
type ProductRepository struct {
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

// Create 建立商品
func (r *ProductRepository) Create(req *models.CreateProductRequest) (*models.Product, error) {
	product := &models.Product{
		ID:              uuid.New().String(),
		Name:            req.Name,
		Artist:          req.Artist,
		Description:     req.Description,
		Category:        req.Category,
		BasePrice:       req.BasePrice,
		ImageURL:        req.ImageURL,
		Images:          req.Images,
		StockStatus:     req.StockStatus,
		IsHot:           req.IsHot,
		IsNew:           req.IsNew,
		PreorderEndDate: req.PreorderEndDate,
		ReleaseDate:     req.ReleaseDate,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// 設定預設庫存狀態
	if product.StockStatus == "" {
		product.StockStatus = models.StockStatusInStock
	}

	// 建立版本
	for _, v := range req.Versions {
		images := sanitizeImageList(v.Images)
		mainImage := v.ImageURL
		if mainImage == "" && len(images) > 0 {
			mainImage = images[0]
		}
		if len(images) == 0 && mainImage != "" {
			images = []string{mainImage}
		}

		product.Versions = append(product.Versions, models.ProductVersion{
			ID:        uuid.New().String(),
			ProductID: product.ID,
			Name:      v.Name,
			Price:     v.Price,
			Stock:     v.Stock,
			SKU:       v.SKU,
			ImageURL:  mainImage,
			Images:    models.StringArray(images),
		})
	}

	if err := r.db.Create(product).Error; err != nil {
		return nil, err
	}

	return product, nil
}

// Update 更新商品
func (r *ProductRepository) Update(id string, req *models.UpdateProductRequest) (*models.Product, error) {
	var product models.Product
	if err := r.db.Preload("Versions").First(&product, "id = ?", id).Error; err != nil {
		return nil, err
	}

	err := r.db.Transaction(func(tx *gorm.DB) error {
		// 更新商品欄位
		if req.Name != nil {
			product.Name = *req.Name
		}
		if req.Artist != nil {
			product.Artist = *req.Artist
		}
		if req.Description != nil {
			product.Description = *req.Description
		}
		if req.Category != nil {
			product.Category = *req.Category
		}
		if req.BasePrice != nil {
			product.BasePrice = *req.BasePrice
		}
		if req.ImageURL != nil {
			product.ImageURL = *req.ImageURL
		}
		if req.Images != nil {
			product.Images = req.Images
		}
		if req.StockStatus != nil {
			product.StockStatus = *req.StockStatus
		}
		if req.IsHot != nil {
			product.IsHot = *req.IsHot
		}
		if req.IsNew != nil {
			product.IsNew = *req.IsNew
		}
		if req.PreorderEndDate != nil {
			product.PreorderEndDate = req.PreorderEndDate
		}
		if req.ReleaseDate != nil {
			product.ReleaseDate = req.ReleaseDate
		}

		product.UpdatedAt = time.Now()

		if err := tx.Save(&product).Error; err != nil {
			return err
		}

		// 同步版本資料（若有提供）
		if req.Versions != nil {
			existingMap := make(map[string]*models.ProductVersion)
			for i := range product.Versions {
				version := &product.Versions[i]
				existingMap[version.ID] = version
			}

			kept := make(map[string]struct{})

			for _, payload := range req.Versions {
				images := sanitizeImageList(payload.Images)
				mainImage := payload.ImageURL
				if mainImage == "" && len(images) > 0 {
					mainImage = images[0]
				}
				if len(images) == 0 && mainImage != "" {
					images = []string{mainImage}
				}

				if payload.ID != "" {
					if existing, ok := existingMap[payload.ID]; ok {
						existing.Name = payload.Name
						existing.Price = payload.Price
						existing.Stock = payload.Stock
						existing.SKU = payload.SKU
						existing.ImageURL = mainImage
						existing.Images = models.StringArray(images)

						if err := tx.Save(existing).Error; err != nil {
							return err
						}
						kept[payload.ID] = struct{}{}
						continue
					}
				}

				newVersion := models.ProductVersion{
					ID:        uuid.New().String(),
					ProductID: product.ID,
					Name:      payload.Name,
					Price:     payload.Price,
					Stock:     payload.Stock,
					SKU:       payload.SKU,
					ImageURL:  mainImage,
					Images:    models.StringArray(images),
				}

				if err := tx.Create(&newVersion).Error; err != nil {
					return err
				}
			}

			// 刪除未保留的舊版本
			var deleteIDs []string
			for id := range existingMap {
				if _, ok := kept[id]; !ok {
					deleteIDs = append(deleteIDs, id)
				}
			}
			if len(deleteIDs) > 0 {
				if err := tx.Where("product_id = ? AND id IN ?", product.ID, deleteIDs).Delete(&models.ProductVersion{}).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	if err := r.db.Preload("Versions").First(&product, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &product, nil
}

// Delete 刪除商品
func (r *ProductRepository) Delete(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 先刪除版本
		if err := tx.Where("product_id = ?", id).Delete(&models.ProductVersion{}).Error; err != nil {
			return err
		}
		// 再刪除商品
		return tx.Where("id = ?", id).Delete(&models.Product{}).Error
	})
}

// CreateVersion 建立商品版本
func (r *ProductRepository) CreateVersion(productID string, req *models.CreateVersionRequest) (*models.ProductVersion, error) {
	// 確認商品存在
	var product models.Product
	if err := r.db.First(&product, "id = ?", productID).Error; err != nil {
		return nil, err
	}

	images := sanitizeImageList(req.Images)
	mainImage := req.ImageURL
	if mainImage == "" && len(images) > 0 {
		mainImage = images[0]
	}
	if len(images) == 0 && mainImage != "" {
		images = []string{mainImage}
	}

	version := &models.ProductVersion{
		ID:        uuid.New().String(),
		ProductID: productID,
		Name:      req.Name,
		Price:     req.Price,
		Stock:     req.Stock,
		SKU:       req.SKU,
		ImageURL:  mainImage,
		Images:    models.StringArray(images),
	}

	if err := r.db.Create(version).Error; err != nil {
		return nil, err
	}

	return version, nil
}

// UpdateVersion 更新商品版本
func (r *ProductRepository) UpdateVersion(productID, versionID string, req *models.UpdateVersionRequest) (*models.ProductVersion, error) {
	var version models.ProductVersion
	if err := r.db.First(&version, "id = ? AND product_id = ?", versionID, productID).Error; err != nil {
		return nil, err
	}

	if req.Name != nil {
		version.Name = *req.Name
	}
	if req.Price != nil {
		version.Price = *req.Price
	}
	if req.Stock != nil {
		version.Stock = *req.Stock
	}
	if req.SKU != nil {
		version.SKU = *req.SKU
	}
	if req.ImageURL != nil {
		version.ImageURL = *req.ImageURL
		if len(version.Images) == 0 && *req.ImageURL != "" {
			version.Images = models.StringArray([]string{*req.ImageURL})
		}
	}
	if req.Images != nil {
		images := sanitizeImageList(req.Images)
		version.Images = models.StringArray(images)
		if len(images) > 0 && (req.ImageURL == nil || *req.ImageURL == "") {
			version.ImageURL = images[0]
		}
		if len(images) == 0 && req.ImageURL == nil {
			version.ImageURL = ""
		}
	}

	if err := r.db.Save(&version).Error; err != nil {
		return nil, err
	}

	return &version, nil
}

// DeleteVersion 刪除商品版本
func (r *ProductRepository) DeleteVersion(productID, versionID string) error {
	return r.db.Where("id = ? AND product_id = ?", versionID, productID).Delete(&models.ProductVersion{}).Error
}

func sanitizeImageList(urls []string) []string {
	if urls == nil {
		return nil
	}
	result := make([]string, 0, len(urls))
	seen := make(map[string]struct{})
	for _, url := range urls {
		trimmed := strings.TrimSpace(url)
		if trimmed == "" {
			continue
		}
		if _, exists := seen[trimmed]; exists {
			continue
		}
		seen[trimmed] = struct{}{}
		result = append(result, trimmed)
	}
	return result
}
