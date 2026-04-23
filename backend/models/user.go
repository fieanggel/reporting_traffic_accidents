package models

import "time"

type UserRole string

const (
    RoleAdmin   UserRole = "admin"
    RoleOfficer UserRole = "officer"
)

type User struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Name        string    `gorm:"type:varchar(100);not null" json:"name"`
    Username    string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"username"`
    Password    string    `gorm:"type:varchar(255);not null" json:"-"`
    
    // PERBAIKAN: Gunakan tipe UserRole kembali, bukan string.
    // Ini supaya sinkron dengan models.RoleAdmin di file config.
    Role        UserRole  `gorm:"type:varchar(20);not null;default:'officer'" json:"role"`
    
    OfficerCode *string   `gorm:"column:officer_id;type:varchar(50);uniqueIndex" json:"officer_id,omitempty"`
    Zone        *string   `gorm:"type:varchar(100)" json:"zone,omitempty"`
    CreatedAt   time.Time `json:"created_at"`

    Reports     []Report  `gorm:"foreignKey:OfficerID" json:"-"`
}

func (User) TableName() string {
    return "users"
}