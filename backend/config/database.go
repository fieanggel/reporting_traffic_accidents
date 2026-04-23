package config

import (
	"fmt"
	"os"

	"responcepat-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectDatabase() (*gorm.DB, error) {
	dbHost := getEnv("DB_HOST", "127.0.0.1")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPass := os.Getenv("DB_PASS")
	dbName := getEnv("DB_NAME", "reportkecelakaan")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Jalankan AutoMigrate
	if err := db.AutoMigrate(&models.User{}, &models.Report{}); err != nil {
		return nil, err
	}

	// Panggil fungsi seeding setelah migrate selesai
	seedAdmin(db)

	return db, nil
}

// Fungsi Internal untuk membuat Akun Admin Otomatis
func seedAdmin(db *gorm.DB) {
	var admin models.User
	// Cek apakah username 'admin' sudah ada di tabel users
	err := db.Where("username = ?", "admin").First(&admin).Error

	if err != nil { // Jika error (artinya user tidak ditemukan)
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		
		newAdmin := models.User{
			Name:     "Super Admin",
			Username: "admin",
			Password: string(hashedPassword),
			// Pastikan di model/user.go tipe Role adalah models.UserRole
			Role:     models.RoleAdmin, 
		}

		if err := db.Create(&newAdmin).Error; err != nil {
			fmt.Println("❌ Gagal membuat admin default:", err)
		} else {
			fmt.Println("✅ Akun Admin Default Berhasil Dibuat!")
			fmt.Println("   Username: admin")
			fmt.Println("   Password: password123")
		}
	} else {
		fmt.Println("ℹ️ Akun Admin sudah tersedia, siap digunakan.")
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}