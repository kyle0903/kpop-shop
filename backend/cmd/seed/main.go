package main

import (
	"log"
	"os"

	"kpop-shop/internal/database"
	"kpop-shop/internal/seed"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	db, err := database.Connect(dsn)
	if err != nil {
		log.Fatalf("connect db failed: %v", err)
	}

	seeder := seed.NewProductSeeder(db)

	p, err := seeder.InsertTestProduct()
	if err != nil {
		log.Fatalf("seed failed: %v", err)
	}
	log.Printf("seed ok: %s (%s)", p.Name, p.ID)
}
