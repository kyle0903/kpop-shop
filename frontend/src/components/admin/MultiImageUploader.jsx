import { useState, useRef } from 'react'
import { adminApi } from '../../services/api'
import './MultiImageUploader.css'

function MultiImageUploader({
  value = [],
  onChange,
  maxImages = 5,
  artist = '',
  productName = '',
  label = '版本圖片（最多 5 張）'
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFilesSelected = async (fileList) => {
    if (!fileList || fileList.length === 0) return

    const remainingSlots = maxImages - value.length
    if (remainingSlots <= 0) {
      alert(`此版本最多只能上傳 ${maxImages} 張圖片`)
      return
    }

    const files = Array.from(fileList).slice(0, remainingSlots)
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const validFiles = files.filter((file) => {
      if (!acceptedTypes.includes(file.type)) {
        alert(`${file.name} 的格式不支援，僅支援 JPG/PNG/WebP`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} 超過 5MB 限制`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    try {
      const uploadTasks = validFiles.map((file) => adminApi.uploadImage(file, artist, productName))
      const results = await Promise.all(uploadTasks)
      const newUrls = results.map((res) => res.url).filter(Boolean)
      onChange([...value, ...newUrls].slice(0, maxImages))
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上傳失敗，請稍後再試')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (event) => {
    handleFilesSelected(event.target.files)
    event.target.value = ''
  }

  const handleRemove = (index) => {
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="multi-image-uploader">
      <label className="uploader-label">{label}</label>

      <div className="images-grid">
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className="image-item">
            <img src={`http://localhost:8080${url}`} alt={`Version ${index + 1}`} />
            <button type="button" className="remove-btn" onClick={() => handleRemove(index)}>
              &times;
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            className={`add-image-btn ${uploading ? 'uploading' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <span>上傳中...</span>
            ) : (
              <>
                <span className="plus-icon">+</span>
                <span>新增圖片</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default MultiImageUploader
