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
	
	// FIX 1: Support DB_PASSWORD dan DB_PASS (backward compatible)
	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" {
		dbPass = os.Getenv("DB_PASS")
	}
	
	// FIX 2: Filter DB_NAME yang tidak valid
	dbName := getEnv("DB_NAME", "reportkecelakaan")
	if dbName == "-" || dbName == "" {
		dbName = "reportkecelakaan"
	}

	// FIX 3: Validasi password tidak boleh kosong
	if dbPass == "" {
		return nil, fmt.Errorf("DB_PASSWORD environment variable is required")
	}

	// Koneksi ke MySQL tanpa pilih database
	dsnRoot := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local", 
		dbUser, dbPass, dbHost, dbPort)
	
	rootDB, err := gorm.Open(mysql.Open(dsnRoot), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL server: %w", err)
	}

	// Create database jika belum ada
	createDBQuery := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName)
	if err := rootDB.Exec(createDBQuery).Error; err != nil {
		return nil, fmt.Errorf("failed to create database: %w", err)
	}

	// Koneksi ke database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", 
		dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// AutoMigrate
	if err := db.AutoMigrate(&models.User{}, &models.Report{}); err != nil {
		return nil, err
	}

	// Seed admin
	seedAdmin(db)

	return db, nil
}

func seedAdmin(db *gorm.DB) {
	var admin models.User
	err := db.Where("username = ?", "admin").First(&admin).Error

	if err != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		
		newAdmin := models.User{
			Name:     "Super Admin",
			Username: "admin",
			Password: string(hashedPassword),
			Role:     models.RoleAdmin,
			// Hanya tambahkan Email jika field Email ada di model User
			// Email: "admin@infraalert.com",
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