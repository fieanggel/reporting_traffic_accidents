package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"responcepat-backend/models"
	"responcepat-backend/repositories"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
)

type ReportController struct {
	reportRepo repositories.ReportRepository
	userRepo   repositories.UserRepository
}

type createReportRequest struct {
	Category    string  `json:"category" form:"category"`
	Description string  `json:"description" form:"description"`
	Address     string  `json:"address" form:"address"`
	Latitude    float64 `json:"latitude" form:"latitude"`
	Longitude   float64 `json:"longitude" form:"longitude"`
	ImageURL    string  `json:"image_url" form:"image_url"`
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

func (r *ReportController) RequestUploadURL(c *gin.Context) {
	var req presignUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "payload tidak valid"})
		return
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		)),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "AWS Config Error"})
		return
	}

	s3Client := s3.NewFromConfig(cfg)
	presignClient := s3.NewPresignClient(s3Client)
	bucket := os.Getenv("AWS_S3_BUCKET_NAME")
	key := "reports/" + req.FileName

	presignedReq, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		ContentType: aws.String(req.ContentType),
	}, s3.WithPresignExpires(time.Minute*15))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal generate link S3"})
		return
	}

	fileURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, os.Getenv("AWS_REGION"), key)
	c.JSON(http.StatusOK, gin.H{"uploadUrl": presignedReq.URL, "fileUrl": fileURL})
}

func (r *ReportController) CreateReport(c *gin.Context) {
	var req createReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "payload tidak valid"})
		return
	}

	report := models.Report{
		Category:    models.ReportCategory(req.Category),
		Description: req.Description,
		Address:     req.Address,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		ImageURL:    req.ImageURL,
		Status:      models.StatusPending,
	}

	r.reportRepo.Create(&report)
	c.JSON(http.StatusCreated, gin.H{"message": "Laporan berhasil", "data": report})
}

// Fungsi dummy agar route tidak error
func (r *ReportController) DirectUpload(c *gin.Context)           {}
func (r *ReportController) GetAllReportsAdmin(c *gin.Context)    {}
func (r *ReportController) AssignOrUpdateReport(c *gin.Context)  {}
func (r *ReportController) GetAssignedReports(c *gin.Context)    {}
func (r *ReportController) CompleteAssignedReport(c *gin.Context) {}

func ParseUintParam(param string) (uint, error) {
	parsed, err := strconv.ParseUint(param, 10, 32)
	return uint(parsed), err
}

func SanitizeUploadPath(rawPath string) (string, error) {
	return path.Clean(strings.TrimPrefix(rawPath, "/")), nil
}