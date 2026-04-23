package repositories

import (
	"responcepat-backend/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *models.User) error
	GetByUsername(username string) (*models.User, error)
	GetByID(id uint) (*models.User, error)
	ListOfficers() ([]models.User, error)
	Update(user *models.User) error
	DeleteByID(id uint) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	// PENTING: .Select("*") memastikan kolom Password dengan tag json:"-" tetap ditarik
	err := r.db.Select("*").Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) ListOfficers() ([]models.User, error) {
	var officers []models.User
	err := r.db.Where("role = ?", "officer").Order("created_at DESC").Find(&officers).Error
	if err != nil {
		return nil, err
	}
	return officers, nil
}

func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) DeleteByID(id uint) error {
	result := r.db.Delete(&models.User{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}