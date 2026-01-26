import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productApi } from '../services/api'
import './HomePage.css'

// 模擬商品資料（當後端未啟動時使用）
const mockProducts = [
  {
    id: '1',
    name: 'BORN PINK',
    artist: 'BLACKPINK',
    description: 'BLACKPINK 第二張正規專輯',
    category: 'album',
    base_price: 580,
    stock_status: 'in_stock',
    is_hot: true,
    is_new: false,
    versions: [
      { id: '1a', name: 'BLACK Ver.', price: 580 },
      { id: '1b', name: 'PINK Ver.', price: 580 }
    ]
  },
  {
    id: '2',
    name: 'GOLDEN',
    artist: 'Jung Kook',
    description: 'BTS 成員 Jung Kook 首張個人專輯',
    category: 'album',
    base_price: 650,
    stock_status: 'in_stock',
    is_hot: true,
    is_new: true,
    versions: [
      { id: '2a', name: 'Solid Ver.', price: 650 },
      { id: '2b', name: 'Shine Ver.', price: 650 }
    ]
  },
  {
    id: '3',
    name: 'DRAMA',
    artist: 'aespa',
    description: 'aespa 第四張迷你專輯',
    category: 'album',
    base_price: 520,
    stock_status: 'in_stock',
    is_hot: false,
    is_new: true,
    versions: [
      { id: '3a', name: 'Sequence Ver.', price: 520 }
    ]
  },
  {
    id: '4',
    name: 'FML',
    artist: 'SEVENTEEN',
    description: 'SEVENTEEN 第四張正規專輯',
    category: 'album',
    base_price: 620,
    stock_status: 'in_stock',
    is_hot: true,
    is_new: false,
    versions: [
      { id: '4a', name: 'Fight Ver.', price: 620 },
      { id: '4b', name: 'Melt Ver.', price: 620 },
      { id: '4c', name: 'Love Ver.', price: 620 }
    ]
  },
  {
    id: '5',
    name: 'BT21 COOKY 玩偶',
    artist: 'BT21',
    description: '官方授權 BT21 COOKY 角色玩偶',
    category: 'merchandise',
    base_price: 890,
    stock_status: 'low_stock',
    is_hot: false,
    is_new: false,
    versions: [{ id: '5a', name: '標準版', price: 890 }]
  },
  {
    id: '6',
    name: 'BLACKPINK 官方手燈',
    artist: 'BLACKPINK',
    description: 'BLACKPINK 官方應援手燈 Ver.2',
    category: 'merchandise',
    base_price: 1280,
    stock_status: 'low_stock',
    is_hot: true,
    is_new: false,
    versions: [{ id: '6a', name: 'Ver.2', price: 1280 }]
  },
  {
    id: '7',
    name: 'SPILL THE FEELS',
    artist: 'STRAY KIDS',
    description: 'STRAY KIDS 即將發行的全新迷你專輯',
    category: 'preorder',
    base_price: 550,
    stock_status: 'preorder',
    is_hot: false,
    is_new: true,
    versions: [
      { id: '7a', name: 'FEEL Ver.', price: 550 },
      { id: '7b', name: 'SPILL Ver.', price: 550 }
    ]
  },
  {
    id: '8',
    name: 'WISH',
    artist: 'NCT WISH',
    description: 'NCT WISH 出道專輯預購',
    category: 'preorder',
    base_price: 380,
    stock_status: 'preorder',
    is_hot: false,
    is_new: true,
    versions: [
      { id: '8a', name: 'Photobook Ver.', price: 480 },
      { id: '8b', name: 'Digipack Ver.', price: 380 }
    ]
  }
]

function HomePage() {
  const [hotProducts, setHotProducts] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [preorderProducts, setPreorderProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getProducts({ pageSize: 20 })
        const products = response.products || []
        
        setHotProducts(products.filter(p => p.is_hot).slice(0, 4))
        setNewProducts(products.filter(p => p.is_new).slice(0, 4))
        setPreorderProducts(products.filter(p => p.category === 'preorder').slice(0, 4))
      } catch (error) {
        console.log('Using mock data:', error.message)
        // 使用模擬資料
        setHotProducts(mockProducts.filter(p => p.is_hot).slice(0, 4))
        setNewProducts(mockProducts.filter(p => p.is_new).slice(0, 4))
        setPreorderProducts(mockProducts.filter(p => p.category === 'preorder').slice(0, 4))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">專業選品 · 安心購買</span>
            <h1 className="hero-title">
              發現您的<br />
              <span className="text-gradient">K-pop 收藏</span>
            </h1>
            <p className="hero-description">
              專輯、周邊、限量預購 — 來自韓國的正版商品，
              <br />為您嚴選每一個值得收藏的瞬間。
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                探索商品
              </Link>
              <Link to="/products?category=preorder" className="btn btn-secondary btn-lg">
                預購專區
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-visual-inner">
              <div className="floating-card card-1">
                <span>♪</span>
              </div>
              <div className="floating-card card-2">
                <span>♫</span>
              </div>
              <div className="floating-card card-3">
                <span>★</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-grid">
            <Link to="/products?category=album" className="category-card">
              <div className="category-icon">💿</div>
              <h3>專輯</h3>
              <p>正規專輯、迷你專輯、單曲</p>
            </Link>
            <Link to="/products?category=merchandise" className="category-card">
              <div className="category-icon">🎁</div>
              <h3>周邊</h3>
              <p>手燈、玩偶、服飾配件</p>
            </Link>
            <Link to="/products?category=preorder" className="category-card">
              <div className="category-icon">⏰</div>
              <h3>預購</h3>
              <p>新專輯預購、限量商品</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Products */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">熱銷商品</h2>
              <p className="section-subtitle">最受歡迎的收藏選擇</p>
            </div>
            <Link to="/products" className="btn btn-ghost">
              查看全部 →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card skeleton-card">
                  <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
                  <div style={{ padding: '1rem' }}>
                    <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '16px' }} />
                    <div className="skeleton" style={{ height: '20px', width: '30%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-4">
              {hotProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="products-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">最新上架</h2>
                <p className="section-subtitle">剛剛到貨的新商品</p>
              </div>
              <Link to="/products" className="btn btn-ghost">
                查看全部 →
              </Link>
            </div>
            
            <div className="grid grid-4">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Preorder Section */}
      {preorderProducts.length > 0 && (
        <section className="products-section preorder-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <span className="preorder-icon">⏰</span>
                  預購專區
                </h2>
                <p className="section-subtitle">搶先預訂，保證有貨</p>
              </div>
              <Link to="/products?category=preorder" className="btn btn-ghost">
                查看全部 →
              </Link>
            </div>
            
            <div className="grid grid-4">
              {preorderProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h4>正版保證</h4>
              <p>100% 韓國正版商品</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h4>安全包裝</h4>
              <p>專業包裝，完整保護</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h4>快速出貨</h4>
              <p>現貨商品 24 小時內出貨</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h4>客服支援</h4>
              <p>專業客服即時回覆</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
