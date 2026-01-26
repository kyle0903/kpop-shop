package models

import "time"

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
	ID          string  `json:"id"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Artist      string  `json:"artist"`
	VersionID   string  `json:"version_id"`
	VersionName string  `json:"version_name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
	ImageURL    string  `json:"image_url"`
}

// ShippingInfo 配送資訊
type ShippingInfo struct {
	Name       string `json:"name" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Address    string `json:"address" binding:"required"`
	City       string `json:"city" binding:"required"`
	PostalCode string `json:"postal_code" binding:"required"`
	Note       string `json:"note"`
}

// Order 訂單
type Order struct {
	ID            string       `json:"id"`
	OrderNumber   string       `json:"order_number"`
	Items         []OrderItem  `json:"items"`
	Subtotal      float64      `json:"subtotal"`
	ShippingFee   float64      `json:"shipping_fee"`
	Total         float64      `json:"total"`
	Status        OrderStatus  `json:"status"`
	ShippingInfo  ShippingInfo `json:"shipping_info"`
	PaymentMethod string       `json:"payment_method"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

// CreateOrderRequest 建立訂單請求
type CreateOrderRequest struct {
	ShippingInfo  ShippingInfo `json:"shipping_info" binding:"required"`
	PaymentMethod string       `json:"payment_method" binding:"required"`
}
