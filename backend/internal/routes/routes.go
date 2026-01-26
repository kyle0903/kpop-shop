package routes

import (
	"time"

	"kpop-shop/internal/handlers"
	"kpop-shop/internal/repository"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter 設定路由
func SetupRouter(productRepo *repository.ProductRepository, cartRepo *repository.CartRepository) *gin.Engine {
	r := gin.Default()

	// CORS 設定
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 靜態文件服務 - 提供圖片
	r.Static("/images", "./static/images")

	// 初始化 handlers
	productHandler := handlers.NewProductHandler(productRepo)
	cartHandler := handlers.NewCartHandler(cartRepo, productRepo)

	// API 路由
	api := r.Group("/api")
	{
		// 商品相關
		api.GET("/products", productHandler.GetProducts)
		api.GET("/products/:id", productHandler.GetProduct)
		api.GET("/categories", productHandler.GetCategories)
		api.GET("/artists", productHandler.GetArtists)

		// 購物車相關
		api.GET("/cart", cartHandler.GetCart)
		api.POST("/cart", cartHandler.AddToCart)
		api.PUT("/cart/:id", cartHandler.UpdateCartItem)
		api.DELETE("/cart/:id", cartHandler.RemoveCartItem)
		api.DELETE("/cart", cartHandler.ClearCart)
	}

	return r
}
