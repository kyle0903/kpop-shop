package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// Category 商品分類
type Category string

const (
	CategoryAlbum       Category = "album"       // 專輯
	CategoryMerchandise Category = "merchandise" // 周邊
	CategoryPreorder    Category = "preorder"    // 預購
)

// StockStatus 庫存狀態
type StockStatus string

const (
	StockStatusInStock    StockStatus = "in_stock"     // 有庫存
	StockStatusLowStock   StockStatus = "low_stock"    // 庫存不足
	StockStatusOutOfStock StockStatus = "out_of_stock" // 缺貨
	StockStatusPreorder   StockStatus = "preorder"     // 預購中
)

// ProductVersion 商品版本
type ProductVersion struct {
	ID        string      `json:"id" gorm:"primaryKey;type:varchar(36)"`
	ProductID string      `json:"product_id" gorm:"type:varchar(36);index"` // 外鍵關聯
	Name      string      `json:"name" gorm:"type:varchar(100)"`            // 版本名稱（如：A版、B版、隨機版）
	Price     float64     `json:"price"`                                    // 價格
	Stock     int         `json:"stock"`                                    // 庫存數量
	SKU       string      `json:"sku" gorm:"type:varchar(50);uniqueIndex"`  // 商品編號
	ImageURL  string      `json:"image_url" gorm:"type:varchar(255)"`       // 版本主圖
	Images    StringArray `json:"images" gorm:"type:text"`                  // 版本圖片列表
}

// Product 商品
type Product struct {
	ID              string           `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name            string           `json:"name" gorm:"type:varchar(200)"`          // 商品名稱
	Artist          string           `json:"artist" gorm:"type:varchar(100);index"`  // 藝人/團體
	Description     string           `json:"description" gorm:"type:text"`           // 商品描述
	Category        Category         `json:"category" gorm:"type:varchar(50);index"` // 商品分類
	Versions        []ProductVersion `json:"versions" gorm:"foreignKey:ProductID"`   // 商品版本
	BasePrice       float64          `json:"base_price"`                             // 基本價格
	ImageURL        string           `json:"image_url" gorm:"type:varchar(255)"`     // 主圖
	Images          StringArray      `json:"images" gorm:"type:text"`                // 商品圖片列表 (JSON 格式儲存)
	StockStatus     StockStatus      `json:"stock_status" gorm:"type:varchar(20)"`   // 庫存狀態
	IsHot           bool             `json:"is_hot"`                                 // 熱賣商品
	IsNew           bool             `json:"is_new"`                                 // 新品
	PreorderEndDate *time.Time       `json:"preorder_end_date"`                      // 預購截止日期
	ReleaseDate     *time.Time       `json:"release_date"`                           // 發售日期
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
}

// StringArray 自訂類型用於 JSON 陣列儲存
type StringArray []string

// Scan 從資料庫讀取 JSON
func (s *StringArray) Scan(value any) error {
	if value == nil {
		*s = []string{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		*s = []string{}
		return nil
	}

	return json.Unmarshal(bytes, s)
}

// Value 寫入資料庫為 JSON
func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	return json.Marshal(s)
}

// ProductFilter 商品篩選條件
type ProductFilter struct {
	Category    Category `form:"category"`
	Artist      string   `form:"artist"`
	Search      string   `form:"search"`
	StockStatus string   `form:"stock_status"`
	SortBy      string   `form:"sort_by"` // price_asc, price_desc, newest, popular
	Page        int      `form:"page"`
	PageSize    int      `form:"page_size"`
}

// ProductListResponse 商品列表回應
type ProductListResponse struct {
	Products   []Product `json:"products"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	PageSize   int       `json:"page_size"`
	TotalPages int       `json:"total_pages"`
}

// CreateProductRequest 建立商品請求
type CreateProductRequest struct {
	Name            string                 `json:"name" binding:"required"`
	Artist          string                 `json:"artist" binding:"required"`
	Description     string                 `json:"description"`
	Category        Category               `json:"category" binding:"required"`
	BasePrice       float64                `json:"base_price" binding:"required"`
	ImageURL        string                 `json:"image_url"`
	Images          []string               `json:"images"`
	StockStatus     StockStatus            `json:"stock_status"`
	IsHot           bool                   `json:"is_hot"`
	IsNew           bool                   `json:"is_new"`
	PreorderEndDate *time.Time             `json:"preorder_end_date"`
	ReleaseDate     *time.Time             `json:"release_date"`
	Versions        []CreateVersionRequest `json:"versions"`
}

// UpdateProductRequest 更新商品請求
type UpdateProductRequest struct {
	Name            *string                `json:"name"`
	Artist          *string                `json:"artist"`
	Description     *string                `json:"description"`
	Category        *Category              `json:"category"`
	BasePrice       *float64               `json:"base_price"`
	ImageURL        *string                `json:"image_url"`
	Images          []string               `json:"images"`
	StockStatus     *StockStatus           `json:"stock_status"`
	IsHot           *bool                  `json:"is_hot"`
	IsNew           *bool                  `json:"is_new"`
	PreorderEndDate *time.Time             `json:"preorder_end_date"`
	ReleaseDate     *time.Time             `json:"release_date"`
	Versions        []UpsertVersionRequest `json:"versions"`
}

// CreateVersionRequest 建立版本請求
type CreateVersionRequest struct {
	Name     string   `json:"name" binding:"required"`
	Price    float64  `json:"price" binding:"required"`
	Stock    int      `json:"stock"`
	SKU      string   `json:"sku" binding:"required"`
	ImageURL string   `json:"image_url"`
	Images   []string `json:"images"`
}

// UpdateVersionRequest 更新版本請求
type UpdateVersionRequest struct {
	Name     *string  `json:"name"`
	Price    *float64 `json:"price"`
	Stock    *int     `json:"stock"`
	SKU      *string  `json:"sku"`
	ImageURL *string  `json:"image_url"`
	Images   []string `json:"images"`
}

// UpsertVersionRequest 用於商品更新時批次同步版本資料
type UpsertVersionRequest struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Price    float64  `json:"price"`
	Stock    int      `json:"stock"`
	SKU      string   `json:"sku"`
	ImageURL string   `json:"image_url"`
	Images   []string `json:"images"`
}
