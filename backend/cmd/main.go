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
		log.Println(".env tidak ditemukan, menggunakan environment sistem")
	}

	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatalf("Gagal koneksi database: %v", err)
	}
	log.Println("✅ Database connected successfully") // TAMBAHAN

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("❌ JWT_SECRET wajib diisi")
	}

	router := routes.SetupRouter(db, jwtSecret)

	// FIX: Ubah fallback port dari 4000 ke 8080 (sesuai Dockerfile & ECS)
	port := getEnv("PORT", "8080")
	log.Printf("🚀 ResponCepat backend berjalan di port :%s", port)

	if err := router.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}