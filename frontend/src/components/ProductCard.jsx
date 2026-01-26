import { Link } from 'react-router-dom'
import { getRelativeTime, isExpiringSoon } from '../utils/dateUtils'
import './ProductCard.css'

function ProductCard({ product }) {
  const { id, name, artist, base_price, image_url, stock_status, is_hot, is_new, category, preorder_end_date } = product

  const getStockBadge = () => {
    switch (stock_status) {
      case 'preorder':
        return <span className="badge badge-preorder">預購中</span>
      case 'low_stock':
        return <span className="badge badge-low-stock">即將售罄</span>
      case 'out_of_stock':
        return <span className="badge badge-out-of-stock">缺貨</span>
      default:
        return null
    }
  }

  const getCategoryLabel = () => {
    switch (category) {
      case 'album': return '專輯'
      case 'merchandise': return '周邊'
      case 'preorder': return '預購'
      default: return ''
    }
  }

  return (
    <Link to={`/products/${id}`} className="product-card card">
      <div className="product-image-wrapper">
        <div className="product-image">
          {image_url ? (
            <img
              src={`http://localhost:8080${image_url}`}
              alt={name}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className="product-image-placeholder" style={{ display: image_url ? 'none' : 'flex' }}>
            <span>{artist?.charAt(0) || 'K'}</span>
          </div>
        </div>
        
        {/* Badges */}
        <div className="product-badges">
          {is_new && <span className="badge badge-new">NEW</span>}
          {is_hot && <span className="badge badge-hot">HOT</span>}
          {getStockBadge()}
        </div>

        {/* Category tag */}
        <span className="product-category">{getCategoryLabel()}</span>
      </div>

      <div className="product-info">
        <p className="product-artist">{artist}</p>
        <h3 className="product-name">{name}</h3>
        
        <div className="product-footer">
          <div className="product-price">
            <span className="price-currency">NT$</span>
            <span className="price">{base_price?.toLocaleString()}</span>
          </div>

          {product.versions?.length > 1 && (
            <span className="product-versions">
              {product.versions.length} 版本
            </span>
          )}
        </div>

        {preorder_end_date && (
          <div className={`preorder-deadline ${isExpiringSoon(preorder_end_date) ? 'expiring-soon' : ''}`}>
            {getRelativeTime(preorder_end_date)}
          </div>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
