package seed

import (
	"strings"
	"time"

	"kpop-shop/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProductSeeder 商品種子資料
type ProductSeeder struct {
	db *gorm.DB
}

// NewProductSeeder 建立商品種子資料實例
func NewProductSeeder(db *gorm.DB) *ProductSeeder {
	return &ProductSeeder{db: db}
}

// InsertTestProduct 插入一筆測試商品
func (s *ProductSeeder) InsertTestProduct() (*models.Product, error) {
	now := time.Now().UTC()
	productID := uuid.New().String()

	artist := "NMIXX"
	name := "BLUE VALENTINE"
	// 圖片路徑格式: /images/products/{artist}/{name}
	imagePath := "/images/products/" + strings.ReplaceAll(artist, " ", "_") + "/" + strings.ReplaceAll(name, " ", "_")

	product := models.Product{
		ID:          productID,
		Name:        name,
		Artist:      artist,
		Description: "NMIXX 首張正式專輯",
		Category:    models.CategoryAlbum,
		BasePrice:   450,
		ImageURL:    imagePath + "/main.jpg",
		Images: models.StringArray{
			imagePath + "/main.jpg",
			imagePath + "/gallery-1.jpg",
			imagePath + "/gallery-2.jpg",
		},
		StockStatus: models.StockStatusInStock,
		IsHot:       true,
		IsNew:       true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.db.Create(&product).Error; err != nil {
		return nil, err
	}

	// 建立商品版本
	versions := []models.ProductVersion{
		{ID: uuid.New().String(), ProductID: product.ID, Name: "Blue Ver.", Price: 450, Stock: 40, SKU: "JYP-NMIXX-001"},
		{ID: uuid.New().String(), ProductID: product.ID, Name: "Blue Valentine Ver.", Price: 450, Stock: 35, SKU: "JYP-NMIXX-002"},
	}
	for _, v := range versions {
		s.db.Create(&v)
	}

	// 重新查詢以載入版本資料
	s.db.Preload("Versions").First(&product, "id = ?", product.ID)

	return &product, nil
}
