package main

import (
	"log"
	"os"

	"responcepat-backend/config"
	"responcepat-backend/routes"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println(".env tidak ditemukan, akan gunakan environment dari sistem")
	}

	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatalf("gagal koneksi database: %v", err)
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET wajib diisi")
	}

	router := routes.SetupRouter(db, jwtSecret)

	port := getEnv("PORT", "8080")
	log.Printf("ResponCepat backend berjalan di http://localhost:%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("gagal menjalankan server: %v", err)
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
