package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// OrderStatus 訂單狀態
type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"    // 待處理
	OrderStatusProcessing OrderStatus = "processing" // 處理中
	OrderStatusShipped    OrderStatus = "shipped"    // 已出貨
	OrderStatusDelivered  OrderStatus = "delivered"  // 已送達
	OrderStatusCancelled  OrderStatus = "cancelled"  // 已取消
)

// OrderItem 訂單項目
type OrderItem struct {
	ID          string  `json:"id" gorm:"primaryKey;type:varchar(36)"`
	OrderID     string  `json:"order_id" gorm:"type:varchar(36);index"`
	ProductID   string  `json:"product_id" gorm:"type:varchar(36)"`
	ProductName string  `json:"product_name" gorm:"type:varchar(200)"`
	Artist      string  `json:"artist" gorm:"type:varchar(100)"`
	VersionID   string  `json:"version_id" gorm:"type:varchar(36)"`
	VersionName string  `json:"version_name" gorm:"type:varchar(100)"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
	ImageURL    string  `json:"image_url" gorm:"type:varchar(255)"`
}

// ShippingInfo 配送資訊 (用 JSON 格式存儲)
type ShippingInfo struct {
	Name       string `json:"name" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Address    string `json:"address" binding:"required"`
	City       string `json:"city" binding:"required"`
	PostalCode string `json:"postal_code" binding:"required"`
	Note       string `json:"note"`
}

// Scan 從資料庫讀取 JSON
func (s *ShippingInfo) Scan(value any) error {
	if value == nil {
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return nil
	}

	return json.Unmarshal(bytes, s)
}

// Value 寫入資料庫為 JSON
func (s ShippingInfo) Value() (driver.Value, error) {
	return json.Marshal(s)
}

// Order 訂單
type Order struct {
	ID            string       `json:"id" gorm:"primaryKey;type:varchar(36)"`
	OrderNumber   string       `json:"order_number" gorm:"type:varchar(50);uniqueIndex"`
	Items         []OrderItem  `json:"items" gorm:"foreignKey:OrderID"`
	Subtotal      float64      `json:"subtotal"`
	ShippingFee   float64      `json:"shipping_fee"`
	Total         float64      `json:"total"`
	Status        OrderStatus  `json:"status" gorm:"type:varchar(20);index"`
	ShippingInfo  ShippingInfo `json:"shipping_info" gorm:"type:text"`
	PaymentMethod string       `json:"payment_method" gorm:"type:varchar(50)"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

// CreateOrderRequest 建立訂單請求
type CreateOrderRequest struct {
	ShippingInfo  ShippingInfo `json:"shipping_info" binding:"required"`
	PaymentMethod string       `json:"payment_method" binding:"required"`
}
