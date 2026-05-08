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

	// Support DB_PASSWORD dan DB_PASS
	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" {
		dbPass = os.Getenv("DB_PASS")
	}

	// Filter DB_NAME yang tidak valid
	dbName := getEnv("DB_NAME", "reportkecelakaan")
	if dbName == "-" || dbName == "" {
		dbName = "reportkecelakaan"
	}

	// Validasi password
	if dbPass == "" {
		return nil, fmt.Errorf("DB_PASSWORD or DB_PASS environment variable is required")
	}

	// Step 1: Koneksi ke MySQL server (tanpa database)
	dsnRoot := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPass, dbHost, dbPort)

	rootDB, err := gorm.Open(mysql.Open(dsnRoot), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL server: %w", err)
	}

	// Step 2: Cek apakah database sudah ada
	var dbExists bool
	checkQuery := fmt.Sprintf("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '%s'", dbName)
	if err := rootDB.Raw(checkQuery).Scan(&dbExists).Error; err != nil {
		fmt.Printf("⚠️ Warning: Failed to check database existence: %v\n", err)
	}

	// Step 3: Buat database jika belum ada
	if !dbExists {
		createDBQuery := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName)
		if err := rootDB.Exec(createDBQuery).Error; err != nil {
			// Fallback: Coba tanpa backtick
			createDBQuery2 := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName)
			if err2 := rootDB.Exec(createDBQuery2).Error; err2 != nil {
				return nil, fmt.Errorf("failed to create database '%s': %v (first attempt: %v)", dbName, err2, err)
			}
		}
		fmt.Printf("✅ Database '%s' berhasil dibuat\n", dbName)
	} else {
		fmt.Printf("ℹ️ Database '%s' sudah ada\n", dbName)
	}

	// Step 4: Koneksi ke database yang sudah ada
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database '%s': %w", dbName, err)
	}

	// Step 5: AutoMigrate (bikin tabel)
	fmt.Println("🔄 Menjalankan AutoMigrate...")
	if err := db.AutoMigrate(&models.User{}, &models.Report{}); err != nil {
		return nil, fmt.Errorf("failed to auto migrate: %w", err)
	}
	fmt.Println("✅ AutoMigrate selesai")

	// Step 6: Seed admin
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