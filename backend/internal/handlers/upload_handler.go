package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// UploadHandler 上傳處理器
type UploadHandler struct {
	uploadDir string
}

// NewUploadHandler 建立上傳處理器
func NewUploadHandler() *UploadHandler {
	uploadDir := filepath.Join("static", "images", "products")
	// 確保目錄存在
	os.MkdirAll(uploadDir, os.ModePerm)
	return &UploadHandler{uploadDir: uploadDir}
}

// sanitizePath 清理路徑名稱，移除不安全字元
func sanitizePath(name string) string {
	// 移除或替換不安全的字元
	replacer := strings.NewReplacer(
		"/", "_",
		"\\", "_",
		":", "_",
		"*", "_",
		"?", "_",
		"\"", "_",
		"<", "_",
		">", "_",
		"|", "_",
		" ", "_",
	)
	return replacer.Replace(name)
}

// UploadImage 上傳單張圖片
func (h *UploadHandler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// 取得 artist 和 product name 參數
	artist := c.PostForm("artist")
	productName := c.PostForm("product_name")

	// 驗證檔案類型
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only jpg, jpeg, png, webp are allowed"})
		return
	}

	// 驗證檔案大小 (5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum size is 5MB"})
		return
	}

	// 建立目錄路徑
	var uploadDir string
	var urlPath string
	if artist != "" && productName != "" {
		// 使用 artist/product_name 結構
		safeArtist := sanitizePath(artist)
		safeName := sanitizePath(productName)
		uploadDir = filepath.Join(h.uploadDir, safeArtist, safeName)
		urlPath = fmt.Sprintf("/images/products/%s/%s/", safeArtist, safeName)
	} else {
		uploadDir = h.uploadDir
		urlPath = "/images/products/"
	}

	// 確保目錄存在
	os.MkdirAll(uploadDir, os.ModePerm)

	// 生成新檔名
	newFilename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join(uploadDir, newFilename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      urlPath + newFilename,
		"filename": newFilename,
	})
}

// UploadMultipleImages 上傳多張圖片
func (h *UploadHandler) UploadMultipleImages(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data"})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	var urls []string
	for _, file := range files {
		// 驗證檔案類型
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
			continue // 跳過不支援的檔案類型
		}

		// 驗證檔案大小 (5MB)
		if file.Size > 5*1024*1024 {
			continue // 跳過太大的檔案
		}

		// 生成新檔名
		newFilename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		savePath := filepath.Join(h.uploadDir, newFilename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			continue // 跳過儲存失敗的檔案
		}

		urls = append(urls, "/images/products/"+newFilename)
	}

	c.JSON(http.StatusOK, gin.H{
		"urls": urls,
	})
}
