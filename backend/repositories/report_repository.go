package repositories

import (
	"time"

	"responcepat-backend/models"

	"gorm.io/gorm"
)

type ReportRepository interface {
	Create(report *models.Report) error
	FindAll(status string, startDate, endDate *time.Time) ([]models.Report, error)
	FindByID(id string) (*models.Report, error)
	FindByOfficerID(officerID uint, status string) ([]models.Report, error)
	Update(report *models.Report) error
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) Create(report *models.Report) error {
	return r.db.Create(report).Error
}

func (r *reportRepository) FindAll(status string, startDate, endDate *time.Time) ([]models.Report, error) {
	query := r.db.Preload("Officer").Order("created_at DESC")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if startDate != nil {
		query = query.Where("DATE(created_at) >= ?", startDate.Format("2006-01-02"))
	}
	if endDate != nil {
		query = query.Where("DATE(created_at) <= ?", endDate.Format("2006-01-02"))
	}

	var reports []models.Report
	err := query.Find(&reports).Error
	if err != nil {
		return nil, err
	}

	return reports, nil
}

func (r *reportRepository) FindByID(id string) (*models.Report, error) {
	var report models.Report
	err := r.db.Preload("Officer").First(&report, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &report, nil
}

func (r *reportRepository) FindByOfficerID(officerID uint, status string) ([]models.Report, error) {
	query := r.db.Preload("Officer").Where("officer_id = ?", officerID).Order("created_at DESC")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var reports []models.Report
	err := query.Find(&reports).Error
	if err != nil {
		return nil, err
	}

	return reports, nil
}

func (r *reportRepository) Update(report *models.Report) error {
	return r.db.Save(report).Error
}
