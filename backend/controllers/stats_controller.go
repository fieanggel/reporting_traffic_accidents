package controllers

import (
	"net/http"
	"responcepat-backend/repositories"
	"github.com/gin-gonic/gin"
)

type StatsController struct {
	statsRepo repositories.StatsRepository
	userRepo  repositories.UserRepository
}

func NewStatsController(statsRepo repositories.StatsRepository, userRepo repositories.UserRepository) *StatsController {
	return &StatsController{
		statsRepo: statsRepo,
		userRepo:  userRepo,
	}
}

func (ctrl *StatsController) GetAdminDashboardStats(c *gin.Context) {
	// Ambil Summary (Total, Pending, dll)
	summary, err := ctrl.statsRepo.GetDashboardSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil summary"})
		return
	}

	// Ambil Kategori (Data untuk Pie Chart)
	categories, _ := ctrl.statsRepo.GetCategoryStats()

	// Ambil Data Petugas Asli untuk Tabel
	officers, _ := ctrl.userRepo.ListOfficers()

	c.JSON(http.StatusOK, gin.H{
		"summary":    summary,
		"categories": categories,
		"officers":   officers,
	})
}