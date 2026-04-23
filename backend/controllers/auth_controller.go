package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"responcepat-backend/middleware"
	"responcepat-backend/models"
	"responcepat-backend/repositories"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct {
	userRepo  repositories.UserRepository
	jwtSecret string
}

type registerRequest struct {
	Name      string  `json:"name" binding:"required"`
	Username  string  `json:"username" binding:"required"`
	Password  string  `json:"password" binding:"required,min=6"`
	Role      string  `json:"role"`
	OfficerID *string `json:"officer_id"`
	Zone      *string `json:"zone"`
}

type loginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func NewAuthController(userRepo repositories.UserRepository, jwtSecret string) *AuthController {
	return &AuthController{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (a *AuthController) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload register tidak valid", "error": err.Error()})
		return
	}

	role := strings.ToLower(strings.TrimSpace(req.Role))
	if role == "" {
		role = string(models.RoleOfficer)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal memproses password"})
		return
	}

	user := models.User{
		Name:        strings.TrimSpace(req.Name),
		Username:    strings.TrimSpace(req.Username),
		Password:    string(hashedPassword),
		// FIX: Melakukan casting string ke models.UserRole agar tidak error
		Role:        models.UserRole(role), 
		OfficerCode: req.OfficerID,
		Zone:        req.Zone,
	}

	if err := a.userRepo.Create(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal membuat user", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "register berhasil", "user": user})
}

func (a *AuthController) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("[DEBUG] Gagal Bind JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload login tidak valid"})
		return
	}

	usernameInput := strings.TrimSpace(req.Username)
	fmt.Printf("[DEBUG] Login Attempt: %s\n", usernameInput)

	user, err := a.userRepo.GetByUsername(usernameInput)
	if err != nil {
		fmt.Printf("[DEBUG] User %s tidak ditemukan: %v\n", usernameInput, err)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "username atau password salah"})
		return
	}

	// VALIDASI DATA PASSWORD DARI DB
	if user.Password == "" {
		fmt.Println("[DEBUG] KRITIKAL: Password di DB terbaca KOSONG. Cek Repository!")
		c.JSON(http.StatusUnauthorized, gin.H{"message": "sistem gagal memvalidasi keamanan"})
		return
	}

	// BANDINGKAN PASSWORD
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		fmt.Printf("[DEBUG] Bcrypt Gagal untuk %s: %v\n", usernameInput, err)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "username atau password salah"})
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, string(user.Role), a.jwtSecret)
	if err != nil {
		fmt.Printf("[DEBUG] Gagal generate token: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal membuat token"})
		return
	}

	fmt.Printf("[DEBUG] LOGIN BERHASIL: %s (%s)\n", user.Username, user.Role)
	c.JSON(http.StatusOK, gin.H{
		"message": "login berhasil",
		"token":   token,
		"user":    user,
	})
}