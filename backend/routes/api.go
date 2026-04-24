package routes

import (
	"net/http"
	"os"
	"strings"
	"time"

	"responcepat-backend/controllers"
	"responcepat-backend/middleware"
	"responcepat-backend/repositories"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, jwtSecret string) *gin.Engine {
	router := gin.Default()

	// --- PERBAIKAN CORS ---
	router.Use(cors.New(cors.Config{
		// Kita gunakan AllowOriginFunc agar lebih dinamis atau ganti ke AllowAllOrigins
		AllowOrigins:     parseAllowedOrigins(), 
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Static("/uploads", "./public/uploads")

	// 1. Inisialisasi Repositories
	userRepo := repositories.NewUserRepository(db)
	reportRepo := repositories.NewReportRepository(db)
	statsRepo := repositories.NewStatsRepository(db)

	// 2. Inisialisasi Controllers
	authController := controllers.NewAuthController(userRepo, jwtSecret)
	reportController := controllers.NewReportController(reportRepo, userRepo)
	officerController := controllers.NewOfficerController(userRepo)
	statsController := controllers.NewStatsController(statsRepo, userRepo)

	api := router.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "ResponCepat API is running"})
		})

		auth := api.Group("/auth")
		{
			auth.POST("/register", authController.Register)
			auth.POST("/login", authController.Login)
		}

		api.POST("/reports", reportController.CreateReport)
		api.POST("/uploads/presign", reportController.RequestUploadURL)
		
		// Note: Route ini mungkin yang menyebabkan kebingungan di screenshot
		// Pastikan frontend memanggil URL S3, bukan URL ini untuk upload gambar
		api.PUT("/uploads/direct/*filePath", reportController.DirectUpload)

		// --- ADMIN ROUTES ---
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(jwtSecret))
		admin.Use(middleware.RequireRoles("admin"))
		{
			admin.GET("/stats", statsController.GetAdminDashboardStats)
			admin.GET("/reports", reportController.GetAllReportsAdmin)
			admin.PUT("/reports/:id", reportController.AssignOrUpdateReport)
			admin.POST("/officers", officerController.CreateOfficer)
			admin.GET("/officers", officerController.ListOfficers)
			admin.GET("/officers/:id", officerController.GetOfficerByID)
			admin.PUT("/officers/:id", officerController.UpdateOfficer)
			admin.DELETE("/officers/:id", officerController.DeleteOfficer)
		}

		// --- OFFICER ROUTES ---
		officer := api.Group("/officer")
		officer.Use(middleware.AuthMiddleware(jwtSecret))
		officer.Use(middleware.RequireRoles("officer"))
		{
			officer.GET("/reports", reportController.GetAssignedReports)
			officer.PUT("/reports/:id/complete", reportController.CompleteAssignedReport)
		}
	}

	return router
}

func parseAllowedOrigins() []string {
	rawOrigins := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	
	// JIKA development dan ingin cepat, kamu bisa return []string{"*"}
	// Tapi karena kamu pakai AllowCredentials: true, "*" tidak diperbolehkan.
	// Jadi kita harus list manual atau tambah IP server kamu.
	
	if rawOrigins == "" {
		return []string{
			"http://localhost:3000", 
			"http://127.0.0.1:3000",
			"http://98.80.187.179:3000", // TAMBAHKAN IP INI (Sesuai screenshot)
		}
	}
	
	parts := strings.Split(rawOrigins, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}