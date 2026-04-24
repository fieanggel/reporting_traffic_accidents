package controllers

import (
	"net/http"
	"strings"

	"responcepat-backend/models"
	"responcepat-backend/repositories"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
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

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	officer := models.User{
		Name:        strings.TrimSpace(req.Name),
		Username:    strings.TrimSpace(req.Username),
		Password:    string(hashedPassword),
		Role:        models.RoleOfficer,
		OfficerCode: req.OfficerID,
		Zone:        req.Zone,
	}

	o.userRepo.Create(&officer)
	c.JSON(http.StatusCreated, gin.H{"message": "officer berhasil dibuat", "data": officer})
}

func (o *OfficerController) ListOfficers(c *gin.Context) {
	officers, _ := o.userRepo.ListOfficers()
	c.JSON(http.StatusOK, gin.H{"data": officers})
}

func (o *OfficerController) GetOfficerByID(c *gin.Context) {
	userID, err := ParseUintParam(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "id tidak valid"})
		return
	}

	officer, _ := o.userRepo.GetByID(userID)
	c.JSON(http.StatusOK, gin.H{"data": officer})
}

func (o *OfficerController) UpdateOfficer(c *gin.Context) {
	userID, err := ParseUintParam(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "id tidak valid"})
		return
	}

	officer, _ := o.userRepo.GetByID(userID)
	o.userRepo.Update(officer)
	c.JSON(http.StatusOK, gin.H{"message": "berhasil diperbarui"})
}

func (o *OfficerController) DeleteOfficer(c *gin.Context) {
	userID, err := ParseUintParam(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "id tidak valid"})
		return
	}
	o.userRepo.DeleteByID(userID)
	c.JSON(http.StatusOK, gin.H{"message": "berhasil dihapus"})
}