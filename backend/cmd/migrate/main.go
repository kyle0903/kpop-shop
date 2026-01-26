package main

import (
	"log"
	"os"

	"kpop-shop/internal/database"
	"kpop-shop/internal/models"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	db, err := database.Connect(dsn)
	if err != nil {
		log.Fatalf("connect db failed: %v", err)
	}

	if err := db.AutoMigrate(
		&models.Product{},
		&models.ProductVersion{},
		// 之後有 Cart 的 table 也加進來
	); err != nil {
		log.Fatalf("auto migrate failed: %v", err)
	}

	log.Println("migrate done")
}
