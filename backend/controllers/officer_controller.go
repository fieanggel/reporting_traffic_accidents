package controllers

import (
	"errors"
	"net/http"
	"strings"

	"responcepat-backend/models"
	"responcepat-backend/repositories"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type OfficerController struct {
	userRepo repositories.UserRepository
}

type createOfficerRequest struct {
	Name      string  `json:"name" binding:"required"`
	Username  string  `json:"username" binding:"required"`
	Password  string  `json:"password" binding:"required,min=6"`
	OfficerID *string `json:"officer_id"`
	Zone      *string `json:"zone"`
}

type updateOfficerRequest struct {
	Name      *string `json:"name"`
	Username  *string `json:"username"`
	Password  *string `json:"password"`
	OfficerID *string `json:"officer_id"`
	Zone      *string `json:"zone"`
}

func NewOfficerController(userRepo repositories.UserRepository) *OfficerController {
	return &OfficerController{userRepo: userRepo}
}

func (o *OfficerController) CreateOfficer(c *gin.Context) {
	var req createOfficerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "payload officer tidak valid", "error": err.Error()})
		return
	}

	existing, err := o.userRepo.GetByUsername(strings.TrimSpace(req.Username))
	if err == nil && existing != nil {
		c.JSON(http.StatusConflict, gin.H{"message": "username sudah digunakan"})
		return
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal validasi username"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal memproses password"})
		return
	}

	officer := models.User{
		Name:        strings.TrimSpace(req.Name),
		Username:    strings.TrimSpace(req.Username),
		Password:    string(hashedPassword),
		Role:        models.RoleOfficer,
		OfficerCode: req.OfficerID,
		Zone:        req.Zone,
	}

	if err := o.userRepo.Create(&officer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal membuat officer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "officer berhasil dibuat",
		"data":    officer,
	})
}

func (o *OfficerController) ListOfficers(c *gin.Context) {
	officers, err := o.userRepo.ListOfficers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil data officer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": officers})
}

func (o *OfficerController) GetOfficerByID(c *gin.Context) {
	userID, err := parseUintParam(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "id officer tidak valid"})
		return
	}

	officer, err := o.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "officer tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil data officer", "error": err.Error()})
		return
	}

	if officer.Role != models.RoleOfficer {
		c.JSON(http.StatusNotFound, gin.H{"message": "user bukan officer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": officer})
}

func (o *OfficerController) UpdateOfficer(c *gin.Context) {
	userID, err := parseUintParam(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "id officer tidak valid"})
		return
	}

	officer, err := o.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "officer tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil officer", "error": err.Error()})
		return
	}

	if officer.Role != models.RoleOfficer {
		c.JSON(http.StatusBadRequest, gin.H{"message": "user ini bukan role officer"})
		return
	}

	var req updateOfficerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "payload update officer tidak valid", "error": err.Error()})
		return
	}

	if req.Name != nil {
		officer.Name = strings.TrimSpace(*req.Name)
	}
	if req.Username != nil {
		officer.Username = strings.TrimSpace(*req.Username)
	}
	if req.OfficerID != nil {
		officer.OfficerCode = req.OfficerID
	}
	if req.Zone != nil {
		officer.Zone = req.Zone
	}
	if req.Password != nil && strings.TrimSpace(*req.Password) != "" {
		hashedPassword, hashErr := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if hashErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal memproses password"})
			return
		}
		officer.Password = string(hashedPassword)
	}

	if err := o.userRepo.Update(officer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal update officer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "officer berhasil diperbarui",
		"data":    officer,
	})
}

func (o *OfficerController) DeleteOfficer(c *gin.Context) {
	userID, err := parseUintParam(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "id officer tidak valid"})
		return
	}

	officer, err := o.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "officer tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil officer", "error": err.Error()})
		return
	}

	if officer.Role != models.RoleOfficer {
		c.JSON(http.StatusBadRequest, gin.H{"message": "hanya akun officer yang bisa dihapus"})
		return
	}

	if err := o.userRepo.DeleteByID(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal menghapus officer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "officer berhasil dihapus"})
}
