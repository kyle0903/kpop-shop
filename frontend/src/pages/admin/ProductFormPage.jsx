import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productApi, adminApi } from '../../services/api'
import ImageUploader from '../../components/admin/ImageUploader'
import VersionEditor from '../../components/admin/VersionEditor'
import './ProductFormPage.css'

function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    description: '',
    category: 'album',
    base_price: 0,
    image_url: '',
    images: [],
    stock_status: 'in_stock',
    is_hot: false,
    is_new: false,
    preorder_end_date: '',
    release_date: '',
    versions: []
  })

  useEffect(() => {
    if (isEditing) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const product = await productApi.getProduct(id)
      const normalizedVersions = (product.versions || []).map(version => {
        const gallery = Array.isArray(version.images)
          ? version.images
              .map(url => (typeof url === 'string' ? url.trim() : ''))
              .filter(url => url && url !== '')
          : []
        const fallbackImage = version.image_url && version.image_url.trim() !== '' ? [version.image_url.trim()] : []
        const primaryImage = (gallery.length > 0 ? gallery[0] : (version.image_url || '').trim()) || ''
        return {
          ...version,
          image_url: primaryImage,
          images: gallery.length > 0 ? gallery : fallbackImage
        }
      })

      setFormData({
        name: product.name || '',
        artist: product.artist || '',
        description: product.description || '',
        category: product.category || 'album',
        base_price: product.base_price || 0,
        image_url: product.image_url || '',
        images: product.images || [],
        stock_status: product.stock_status || 'in_stock',
        is_hot: product.is_hot || false,
        is_new: product.is_new || false,
        preorder_end_date: product.preorder_end_date ? product.preorder_end_date.slice(0, 10) : '',
        release_date: product.release_date ? product.release_date.slice(0, 10) : '',
        versions: normalizedVersions
      })
    } catch (error) {
      console.error('Failed to fetch product:', error)
      alert('無法載入商品資料')
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 驗證
    if (!formData.name.trim()) {
      alert('請輸入商品名稱')
      return
    }
    if (!formData.artist.trim()) {
      alert('請輸入藝人名稱')
      return
    }
    if (formData.base_price <= 0) {
      alert('請輸入有效的價格')
      return
    }

    setSaving(true)
    try {
      const sanitizedVersions = formData.versions.map(version => {
        const gallery = Array.isArray(version.images)
          ? version.images
              .map(url => (typeof url === 'string' ? url.trim() : ''))
              .filter(url => url && url !== '')
          : []
        const fallbackImage = version.image_url?.trim() || ''
        const primaryImage = gallery[0] || fallbackImage

        return {
          ...version,
          price: typeof version.price === 'number' ? version.price : parseFloat(version.price) || 0,
          stock: typeof version.stock === 'number' ? version.stock : parseInt(version.stock) || 0,
          image_url: primaryImage,
          images: gallery.length > 0 ? gallery : (primaryImage ? [primaryImage] : [])
        }
      })

      const mainImage = formData.image_url?.trim() || ''
      const combinedImages = []
      const pushImage = (url) => {
        if (!url || url.trim() === '' || combinedImages.includes(url)) return
        combinedImages.push(url)
      }
      pushImage(mainImage)
      sanitizedVersions.forEach(v => v.images.forEach(pushImage))

      const data = {
        ...formData,
        image_url: mainImage,
        versions: sanitizedVersions,
        base_price: parseFloat(formData.base_price),
        images: combinedImages,
        preorder_end_date: formData.preorder_end_date ? new Date(formData.preorder_end_date).toISOString() : null,
        release_date: formData.release_date ? new Date(formData.release_date).toISOString() : null
      }

      if (isEditing) {
        await adminApi.updateProduct(id, data)
      } else {
        await adminApi.createProduct(data)
      }

      navigate('/admin/products')
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div className="product-form-page">
      <div className="page-header">
        <h1>{isEditing ? '編輯商品' : '新增商品'}</h1>
        <Link to="/admin/products" className="btn-back">
          返回列表
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>基本資訊</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>商品名稱 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="輸入商品名稱"
              />
            </div>
            <div className="form-group">
              <label>藝人/團體 *</label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="輸入藝人或團體名稱"
              />
            </div>
            <div className="form-group">
              <label>分類 *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="album">專輯</option>
                <option value="merchandise">周邊</option>
                <option value="preorder">預購</option>
              </select>
            </div>
            <div className="form-group">
              <label>基本價格 *</label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>商品描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="輸入商品描述..."
            />
          </div>
        </div>

        <div className="form-section">
          <h2>狀態設定</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>庫存狀態</label>
              <select name="stock_status" value={formData.stock_status} onChange={handleChange}>
                <option value="in_stock">有庫存</option>
                <option value="low_stock">庫存不足</option>
                <option value="out_of_stock">缺貨</option>
                <option value="preorder">預購中</option>
              </select>
            </div>
            <div className="form-group">
              <label>預購截止日期</label>
              <input
                type="date"
                name="preorder_end_date"
                value={formData.preorder_end_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>發售日期</label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_hot"
                checked={formData.is_hot}
                onChange={handleChange}
              />
              <span>熱賣商品</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_new"
                checked={formData.is_new}
                onChange={handleChange}
              />
              <span>新品上架</span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>商品圖片</h2>
          <ImageUploader
            label="主圖 *"
            value={formData.image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            artist={formData.artist}
            productName={formData.name}
          />
          <p className="form-hint">其他圖片會自動從版本圖片收集</p>
        </div>

        <div className="form-section">
          <VersionEditor
            versions={formData.versions}
            onChange={(versions) => setFormData(prev => ({ ...prev, versions }))}
            artist={formData.artist}
            productName={formData.name}
          />
        </div>

        <div className="form-actions">
          <Link to="/admin/products" className="btn-cancel">
            取消
          </Link>
          <button type="submit" className="btn-submit" disabled={saving}>
            {saving ? '儲存中...' : (isEditing ? '更新商品' : '建立商品')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductFormPage
