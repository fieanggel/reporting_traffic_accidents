package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, username string, role string, secret string) (string, error) {
	claims := JWTClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization header wajib diisi"})
			c.Abort()
			return
		}

		tokenParts := strings.SplitN(header, " ", 2)
		if len(tokenParts) != 2 || !strings.EqualFold(tokenParts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Format token harus Bearer <token>"})
			c.Abort()
			return
		}

		tokenStr := tokenParts[1]
		token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("metode tanda tangan token tidak valid")
			}
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Token tidak valid atau sudah kedaluwarsa"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*JWTClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Token claims tidak valid"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		currentRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"message": "Role user tidak ditemukan"})
			c.Abort()
			return
		}

		roleValue, ok := currentRole.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"message": "Role user tidak valid"})
			c.Abort()
			return
		}

		for _, role := range allowedRoles {
			if roleValue == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"message": "Akses ditolak untuk role ini"})
		c.Abort()
	}
}

func GetCurrentUserID(c *gin.Context) (uint, bool) {
	value, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}

	userID, ok := value.(uint)
	if !ok {
		return 0, false
	}

	return userID, true
}
