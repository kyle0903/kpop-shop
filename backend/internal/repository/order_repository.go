package repository

import (
	"kpop-shop/internal/models"

	"gorm.io/gorm"
)

// OrderRepository 訂單資料庫存取層
type OrderRepository struct {
	db *gorm.DB
}

// NewOrderRepository 建立訂單資料庫實例
func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// Create 建立訂單
func (r *OrderRepository) Create(order *models.Order) error {
	return r.db.Create(order).Error
}

// GetByID 透過 ID 取得訂單
func (r *OrderRepository) GetByID(id string) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("Items").First(&order, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}
