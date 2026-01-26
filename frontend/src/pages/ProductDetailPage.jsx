import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productApi, cartApi } from '../services/api'
import { formatDateTaipei, getRelativeTime, isExpiringSoon } from '../utils/dateUtils'
import './ProductDetailPage.css'

// 模擬商品資料
const mockProducts = {
  '1': {
    id: '1', name: 'BORN PINK', artist: 'BLACKPINK', category: 'album',
    description: 'BLACKPINK 第二張正規專輯，收錄多首熱門歌曲包括 Shut Down、Pink Venom 等。專輯以黑與粉紅為主題，展現 BLACKPINK 獨特的音樂風格與強大氣場。',
    base_price: 580, stock_status: 'in_stock', is_hot: true, is_new: false,
    versions: [
      { id: '1a', name: 'BLACK Ver.', price: 580, stock: 25 },
      { id: '1b', name: 'PINK Ver.', price: 580, stock: 30 },
      { id: '1c', name: 'GRAY Ver.', price: 580, stock: 18 }
    ]
  },
  '2': {
    id: '2', name: 'GOLDEN', artist: 'Jung Kook', category: 'album',
    description: 'BTS 成員 Jung Kook 首張個人專輯，展現多元音樂風格。收錄 Standing Next to You、3D 等熱門歌曲。',
    base_price: 650, stock_status: 'in_stock', is_hot: true, is_new: true,
    versions: [
      { id: '2a', name: 'Solid Ver.', price: 650, stock: 40 },
      { id: '2b', name: 'Shine Ver.', price: 650, stock: 35 }
    ]
  }
}

function ProductDetailPage({ updateCartCount }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showAddedMessage, setShowAddedMessage] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await productApi.getProduct(id)
        setProduct(data)
        if (data.versions?.length > 0) {
          setSelectedVersion(data.versions[0])
        }
      } catch (error) {
        console.log('Using mock data:', error.message)
        // 使用模擬資料
        const mockProduct = mockProducts[id] || mockProducts['1']
        setProduct(mockProduct)
        if (mockProduct.versions?.length > 0) {
          setSelectedVersion(mockProduct.versions[0])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!selectedVersion) return
    
    setAddingToCart(true)
    try {
      const cart = await cartApi.addToCart(product.id, selectedVersion.id, quantity)
      updateCartCount?.(cart.item_count)
      setShowAddedMessage(true)
      setTimeout(() => setShowAddedMessage(false), 2000)
    } catch (error) {
      console.log('Failed to add to cart:', error.message)
      // 模擬成功
      setShowAddedMessage(true)
      setTimeout(() => setShowAddedMessage(false), 2000)
    } finally {
      setAddingToCart(false)
    }
  }

  const getStockStatusText = (status) => {
    switch (status) {
      case 'in_stock': return '有庫存'
      case 'low_stock': return '庫存不足'
      case 'out_of_stock': return '缺貨'
      case 'preorder': return '預購中'
      default: return ''
    }
  }

  const getCategoryText = (category) => {
    switch (category) {
      case 'album': return '專輯'
      case 'merchandise': return '周邊'
      case 'preorder': return '預購'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-layout">
            <div className="skeleton" style={{ aspectRatio: '1', width: '100%', borderRadius: '12px' }} />
            <div className="product-detail-info">
              <div className="skeleton" style={{ height: '20px', width: '30%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '32px', width: '80%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '32px' }} />
              <div className="skeleton" style={{ height: '48px', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="empty-state">
            <h2>找不到商品</h2>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              返回商品列表
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <a href="/">首頁</a>
          <span>/</span>
          <a href="/products">商品</a>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-layout">
          {/* Product Image */}
          <div className="product-detail-image">
            <div className="product-image-main">
              {product.images?.length > 0 ? (
                <img
                  src={`http://localhost:8080${product.images[currentImageIndex]}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : product.image_url ? (
                <img
                  src={`http://localhost:8080${product.image_url}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className="product-image-placeholder"
                style={{ display: (product.images?.length > 0 || product.image_url) ? 'none' : 'flex' }}
              >
                <span>{product.artist?.charAt(0) || 'K'}</span>
              </div>
            </div>
            {/* 縮略圖 */}
            {product.images?.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={`http://localhost:8080${img}`} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <div className="product-meta">
              <span className="product-category-tag">{getCategoryText(product.category)}</span>
              <span className={`stock-status status-${product.stock_status}`}>
                {getStockStatusText(product.stock_status)}
              </span>
            </div>

            <p className="product-artist-name">{product.artist}</p>
            <h1 className="product-detail-name">{product.name}</h1>
            
            <p className="product-description">{product.description}</p>

            {/* Date Information */}
            {(product.preorder_end_date || product.release_date) && (
              <div className="product-dates">
                {product.preorder_end_date && (
                  <div className={`date-item ${isExpiringSoon(product.preorder_end_date) ? 'expiring-soon' : ''}`}>
                    <span className="date-label">預購截止</span>
                    <span className="date-value">{formatDateTaipei(product.preorder_end_date)}</span>
                    <span className="date-relative">{getRelativeTime(product.preorder_end_date)}</span>
                  </div>
                )}
                {product.release_date && (
                  <div className="date-item">
                    <span className="date-label">發售日期</span>
                    <span className="date-value">{formatDateTaipei(product.release_date)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Version Selection */}
            {product.versions?.length > 0 && (
              <div className="version-section">
                <h3 className="section-label">選擇版本</h3>
                <div className="version-options">
                  {product.versions.map(version => (
                    <button
                      key={version.id}
                      className={`version-option ${selectedVersion?.id === version.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <span className="version-name">{version.name}</span>
                      <span className="version-price">NT$ {version.price?.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-section">
              <h3 className="section-label">數量</h3>
              <div className="quantity-control">
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="price-section">
              <span className="price-label">總計</span>
              <div className="total-price">
                <span className="currency">NT$</span>
                <span className="amount">
                  {((selectedVersion?.price || product.base_price) * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button 
                className="btn btn-primary btn-lg add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock_status === 'out_of_stock'}
              >
                {addingToCart ? '加入中...' : 
                 product.stock_status === 'out_of_stock' ? '缺貨中' :
                 product.stock_status === 'preorder' ? '立即預購' : '加入購物車'}
              </button>
            </div>

            {/* Added message */}
            {showAddedMessage && (
              <div className="added-message">
                ✓ 已加入購物車
              </div>
            )}

            {/* Info */}
            <div className="product-info-list">
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>100% 正版商品</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📦</span>
                <span>現貨 24 小時內出貨</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <span>安全交易保障</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
