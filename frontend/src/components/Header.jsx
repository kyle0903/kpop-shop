import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header({ cartItemCount = 0 }) {
  const location = useLocation()
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="header">
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-icon">♪</span>
          <span className="logo-text">K-Select</span>
        </Link>

        {/* Navigation */}
        <nav className="nav">
          <Link 
            to="/products?category=album" 
            className={`nav-link ${isActive('/products') && location.search.includes('album') ? 'active' : ''}`}
          >
            專輯
          </Link>
          <Link 
            to="/products?category=merchandise" 
            className={`nav-link ${isActive('/products') && location.search.includes('merchandise') ? 'active' : ''}`}
          >
            周邊
          </Link>
          <Link 
            to="/products?category=preorder" 
            className={`nav-link ${isActive('/products') && location.search.includes('preorder') ? 'active' : ''}`}
          >
            預購
          </Link>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Search */}
          <div className="search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="搜尋商品..." 
              className="search-input"
            />
          </div>

          {/* Cart */}
          <Link to="/cart" className="cart-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
