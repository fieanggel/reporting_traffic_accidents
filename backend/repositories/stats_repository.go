package repositories

import (
	"responcepat-backend/models"
	"gorm.io/gorm"
)

type StatsRepository interface {
	GetDashboardSummary() (map[string]int64, error)
	GetCategoryStats() ([]map[string]interface{}, error)
}

type statsRepository struct {
	db *gorm.DB
}

func NewStatsRepository(db *gorm.DB) StatsRepository {
	return &statsRepository{db}
}

func (r *statsRepository) GetDashboardSummary() (map[string]int64, error) {
	var total, officers, pending, resolved int64

	r.db.Model(&models.Report{}).Count(&total)
	r.db.Model(&models.User{}).Where("role = ?", "officer").Count(&officers)
	r.db.Model(&models.Report{}).Where("status = ?", "pending").Count(&pending)
	r.db.Model(&models.Report{}).Where("status = ?", "resolved").Count(&resolved)

	return map[string]int64{
		"total_incidents": total,
		"active_officers": officers,
		"pending":         pending,
		"resolved":        resolved,
	}, nil
}

func (r *statsRepository) GetCategoryStats() ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	// Sesuaikan nama kolom 'category' dengan yang ada di struct Report kamu
	err := r.db.Model(&models.Report{}).
		Select("category as label, count(*) as value").
		Group("category").
		Find(&results).Error
	return results, err
}