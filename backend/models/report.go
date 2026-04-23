package models

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

type ReportCategory string

type ReportStatus string

const (
	CategoryAccident ReportCategory = "Kecelakaan"
	CategoryTraffic  ReportCategory = "Kemacetan"

	StatusPending ReportStatus = "Pending"
	StatusProses  ReportStatus = "Proses"
	StatusDone    ReportStatus = "Selesai"
)

type Report struct {
	ID          string         `gorm:"primaryKey;type:varchar(20)" json:"id"`
	Category    ReportCategory `gorm:"type:enum('Kecelakaan','Kemacetan');not null" json:"category"`
	Description string         `gorm:"type:text;not null" json:"description"`
	Address     string         `gorm:"type:varchar(255);not null" json:"address"`
	Latitude    float64        `gorm:"type:double;not null" json:"latitude"`
	Longitude   float64        `gorm:"type:double;not null" json:"longitude"`
	ImageURL    string         `gorm:"column:image_url;type:varchar(512)" json:"image_url"`
	Status      ReportStatus   `gorm:"type:enum('Pending','Proses','Selesai');not null;default:'Pending'" json:"status"`
	OfficerID   *uint          `gorm:"column:officer_id;index" json:"officer_id,omitempty"`
	Officer     *User          `gorm:"foreignKey:OfficerID" json:"officer,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

func (Report) TableName() string {
	return "reports"
}

func (r *Report) BeforeCreate(tx *gorm.DB) error {
	if r.ID != "" {
		return nil
	}

	year := time.Now().Year()
	prefix := fmt.Sprintf("REP-%d-", year)

	var latestID string
	err := tx.Model(&Report{}).
		Select("id").
		Where("id LIKE ?", prefix+"%").
		Order("id DESC").
		Limit(1).
		Scan(&latestID).Error
	if err != nil {
		return err
	}

	nextNumber := 1
	if latestID != "" {
		parts := strings.Split(latestID, "-")
		if len(parts) == 3 {
			parsed, parseErr := strconv.Atoi(parts[2])
			if parseErr == nil {
				nextNumber = parsed + 1
			}
		}
	}

	r.ID = fmt.Sprintf("REP-%d-%03d", year, nextNumber)
	if r.Status == "" {
		r.Status = StatusPending
	}

	return nil
}
