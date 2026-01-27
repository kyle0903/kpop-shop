import { useState, useRef } from 'react'
import { adminApi } from '../../services/api'
import './ImageUploader.css'

function ImageUploader({ value, onChange, label = '上傳圖片', artist = '', productName = '' }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (file) => {
    if (!file) return

    // 驗證檔案類型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('只支援 JPG、PNG、WebP 格式')
      return
    }

    // 驗證檔案大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('檔案大小不能超過 5MB')
      return
    }

    setUploading(true)
    try {
      const result = await adminApi.uploadImage(file, artist, productName)
      onChange(result.url)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="image-uploader">
      <label className="uploader-label">{label}</label>
      {value ? (
        <div className="image-preview">
          <img src={`http://localhost:8080${value}`} alt="Preview" />
          <button type="button" className="remove-btn" onClick={handleRemove}>
            &times;
          </button>
        </div>
      ) : (
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <span>上傳中...</span>
          ) : (
            <>
              <span className="upload-icon">+</span>
              <span>點擊或拖放圖片</span>
              <span className="hint">支援 JPG、PNG、WebP，最大 5MB</span>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUploader
