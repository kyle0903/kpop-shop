package models

import "time"

// CartItem 購物車項目
type CartItem struct {
	ID          string  `json:"id"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Artist      string  `json:"artist"`
	VersionID   string  `json:"version_id"`
	VersionName string  `json:"version_name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	ImageURL    string  `json:"image_url"`
	Subtotal    float64 `json:"subtotal"`
}

// Cart 購物車
type Cart struct {
	ID        string     `json:"id"`
	Items     []CartItem `json:"items"`
	Total     float64    `json:"total"`
	ItemCount int        `json:"item_count"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// AddToCartRequest 加入購物車請求
type AddToCartRequest struct {
	ProductID string `json:"product_id" binding:"required"`
	VersionID string `json:"version_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

// UpdateCartItemRequest 更新購物車項目請求
type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required,min=0"`
}
