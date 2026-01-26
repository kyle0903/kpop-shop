package main

import (
	"log"
	"os"

	"kpop-shop/internal/database"
	"kpop-shop/internal/repository"
	"kpop-shop/internal/routes"

	"github.com/joho/godotenv"
)

func main() {
	// 載入 .env 文件
	if err := godotenv.Load(); err != nil {
		log.Println("未找到 .env 文件，使用系統環境變數")
	}
	dsn := os.Getenv("DATABASE_URL")

	// 連接資料庫
	db, err := database.Connect(dsn)
	if err != nil {
		log.Fatalf("無法連接資料庫: %v", err)
	}

	// 初始化商品 Repository 並建立資料表
	productRepo := repository.NewProductRepository(db)
	cartRepo := repository.NewCartRepository()

	// 設定路由
	r := routes.SetupRouter(productRepo, cartRepo)

	log.Println("K-pop Shop API Server starting on :8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
