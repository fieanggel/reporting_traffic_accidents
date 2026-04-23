package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"responcepat-backend/middleware"
	"responcepat-backend/models"
	"responcepat-backend/repositories"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReportController struct {
	reportRepo repositories.ReportRepository
	userRepo   repositories.UserRepository
}

type createReportRequest struct {
	Category    string  `json:"category" form:"category"`
	Description string  `json:"description" form:"description"`
	Address     string  `json:"address" form:"address"`
	Location    string  `json:"location" form:"location"`
	Latitude    float64 `json:"latitude" form:"latitude"`
	Longitude   float64 `json:"longitude" form:"longitude"`
	ImageURL    string  `json:"image_url" form:"image_url"`
	PhotoURL    string  `json:"photoUrl" form:"photoUrl"`
}

type adminUpdateReportRequest struct {
	Status    *string `json:"status"`
	OfficerID *uint   `json:"officer_id"`
}

type presignUploadRequest struct {
	FileName    string `json:"fileName" binding:"required"`
	ContentType string `json:"contentType"`
}

func NewReportController(reportRepo repositories.ReportRepository, userRepo repositories.UserRepository) *ReportController {
	return &ReportController{
		reportRepo: reportRepo,
		userRepo:   userRepo,
	}
}

func (r *ReportController) CreateReport(c *gin.Context) {
	var req createReportRequest
	contentType := c.ContentType()

	if strings.Contains(contentType, "multipart/form-data") {
		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "payload multipart tidak valid", "error": err.Error()})
			return
		}
	} else {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "payload JSON tidak valid", "error": err.Error()})
			return
		}
	}

	category := strings.TrimSpace(req.Category)
	if category == "" {
		category = string(models.CategoryAccident)
	}
	if !isValidCategory(category) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "category harus Kecelakaan atau Kemacetan"})
		return
	}

	address := strings.TrimSpace(req.Address)
	if address == "" {
		address = strings.TrimSpace(req.Location)
	}
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "address wajib diisi"})
		return
	}

	description := strings.TrimSpace(req.Description)
	if description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "description wajib diisi"})
		return
	}

	if req.Latitude == 0 && req.Longitude == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "latitude dan longitude wajib diisi"})
		return
	}

	imageURL := strings.TrimSpace(req.ImageURL)
	if imageURL == "" {
		imageURL = strings.TrimSpace(req.PhotoURL)
	}

	if strings.Contains(contentType, "multipart/form-data") {
		uploadedURL, err := saveUploadedImage(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal menyimpan file upload", "error": err.Error()})
			return
		}
		if uploadedURL != "" {
			imageURL = uploadedURL
		}
	}

	report := models.Report{
		Category:    models.ReportCategory(category),
		Description: description,
		Address:     address,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		ImageURL:    imageURL,
		Status:      models.StatusPending,
	}

	if err := r.reportRepo.Create(&report); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal membuat laporan", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "laporan berhasil dibuat",
		"data":    report,
	})
}

func (r *ReportController) GetAllReportsAdmin(c *gin.Context) {
	status := strings.TrimSpace(c.Query("status"))
	if status != "" && !isValidStatus(status) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "status tidak valid"})
		return
	}

	startDate, err := parseDateParam(c.Query("start_date"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "format start_date harus YYYY-MM-DD"})
		return
	}

	endDate, err := parseDateParam(c.Query("end_date"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "format end_date harus YYYY-MM-DD"})
		return
	}

	reports, err := r.reportRepo.FindAll(status, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil data laporan", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reports})
}

func (r *ReportController) AssignOrUpdateReport(c *gin.Context) {
	reportID := c.Param("id")
	var req adminUpdateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "payload update report tidak valid", "error": err.Error()})
		return
	}

	if req.Status == nil && req.OfficerID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "minimal kirim status atau officer_id"})
		return
	}

	report, err := r.reportRepo.FindByID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "laporan tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil laporan", "error": err.Error()})
		return
	}

	if req.Status != nil {
		statusValue := strings.TrimSpace(*req.Status)
		if !isValidStatus(statusValue) {
			c.JSON(http.StatusBadRequest, gin.H{"message": "status harus Pending, Proses, atau Selesai"})
			return
		}
		report.Status = models.ReportStatus(statusValue)
	}

	if req.OfficerID != nil {
		officer, err := r.userRepo.GetByID(*req.OfficerID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"message": "officer_id tidak ditemukan"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal validasi officer", "error": err.Error()})
			return
		}
		if officer.Role != models.RoleOfficer {
			c.JSON(http.StatusBadRequest, gin.H{"message": "user yang dipilih bukan role officer"})
			return
		}
		report.OfficerID = req.OfficerID
	}

	if err := r.reportRepo.Update(report); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal update laporan", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "laporan berhasil diperbarui",
		"data":    report,
	})
}

func (r *ReportController) GetAssignedReports(c *gin.Context) {
	userID, ok := middleware.GetCurrentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "token user tidak valid"})
		return
	}

	status := strings.TrimSpace(c.Query("status"))
	if status != "" && !isValidStatus(status) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "status tidak valid"})
		return
	}

	reports, err := r.reportRepo.FindByOfficerID(userID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil laporan officer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reports})
}

func (r *ReportController) CompleteAssignedReport(c *gin.Context) {
	userID, ok := middleware.GetCurrentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "token user tidak valid"})
		return
	}

	reportID := c.Param("id")
	report, err := r.reportRepo.FindByID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "laporan tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil laporan", "error": err.Error()})
		return
	}

	if report.OfficerID == nil || *report.OfficerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"message": "laporan ini bukan assignment Anda"})
		return
	}

	report.Status = models.StatusDone
	if err := r.reportRepo.Update(report); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal update status laporan", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "laporan berhasil diselesaikan",
		"data":    report,
	})
}

func (r *ReportController) RequestUploadURL(c *gin.Context) {
	var req presignUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "payload upload tidak valid", "error": err.Error()})
		return
	}

	safePath, err := sanitizeUploadPath(req.FileName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	scheme := requestScheme(c)
	uploadURL := fmt.Sprintf("%s://%s/api/uploads/direct/%s", scheme, c.Request.Host, safePath)
	fileURL := fmt.Sprintf("/uploads/%s", safePath)

	c.JSON(http.StatusOK, gin.H{
		"uploadUrl": uploadURL,
		"fileUrl":   fileURL,
	})
}

func (r *ReportController) DirectUpload(c *gin.Context) {
	rawPath := strings.TrimPrefix(c.Param("filePath"), "/")
	safePath, err := sanitizeUploadPath(rawPath)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	targetFile := filepath.Join("public", "uploads", filepath.FromSlash(safePath))
	if err := os.MkdirAll(filepath.Dir(targetFile), 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal membuat folder upload", "error": err.Error()})
		return
	}

	file, err := os.Create(targetFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal membuat file upload", "error": err.Error()})
		return
	}
	defer file.Close()

	if _, err := io.Copy(file, c.Request.Body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal menyimpan data upload", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "file berhasil diupload",
		"file_url": fmt.Sprintf("/uploads/%s", safePath),
	})
}

func saveUploadedImage(c *gin.Context) (string, error) {
	fields := []string{"image", "file", "photo"}
	var fileHeader *multipart.FileHeader

	for _, field := range fields {
		header, err := c.FormFile(field)
		if err == nil {
			fileHeader = header
			break
		}
	}

	if fileHeader == nil {
		return "", nil
	}

	fileExt := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if fileExt == "" {
		fileExt = ".jpg"
	}

	entropy := make([]byte, 4)
	if _, err := rand.Read(entropy); err != nil {
		return "", err
	}
	fileName := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), hex.EncodeToString(entropy), fileExt)

	uploadDir := filepath.Join("public", "uploads")
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return "", err
	}

	targetPath := filepath.Join(uploadDir, fileName)
	if err := c.SaveUploadedFile(fileHeader, targetPath); err != nil {
		return "", err
	}

	return "/uploads/" + fileName, nil
}

func sanitizeUploadPath(rawPath string) (string, error) {
	normalized := strings.ReplaceAll(strings.TrimSpace(rawPath), "\\", "/")
	cleaned := path.Clean(normalized)
	cleaned = strings.TrimPrefix(cleaned, "/")

	if cleaned == "." || cleaned == "" {
		return "", errors.New("nama file tidak valid")
	}
	if strings.Contains(cleaned, "..") {
		return "", errors.New("path file tidak valid")
	}
	if strings.Contains(cleaned, ":") {
		return "", errors.New("path file tidak valid")
	}

	return cleaned, nil
}

func requestScheme(c *gin.Context) string {
	if forwardedProto := c.GetHeader("X-Forwarded-Proto"); forwardedProto != "" {
		return forwardedProto
	}
	if c.Request.TLS != nil {
		return "https"
	}
	return "http"
}

func parseDateParam(value string) (*time.Time, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil, nil
	}

	parsed, err := time.Parse("2006-01-02", trimmed)
	if err != nil {
		return nil, err
	}

	return &parsed, nil
}

func isValidCategory(category string) bool {
	return category == string(models.CategoryAccident) || category == string(models.CategoryTraffic)
}

func isValidStatus(status string) bool {
	return status == string(models.StatusPending) || status == string(models.StatusProses) || status == string(models.StatusDone)
}

func parseUintParam(param string) (uint, error) {
	parsed, err := strconv.ParseUint(param, 10, 32)
	if err != nil {
		return 0, err
	}

	return uint(parsed), nil
}
