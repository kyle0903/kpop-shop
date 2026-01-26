import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productApi } from '../services/api'
import './ProductListPage.css'

// 模擬商品資料
const mockProducts = [
  {
    id: '1', name: 'BORN PINK', artist: 'BLACKPINK', category: 'album',
    base_price: 580, stock_status: 'in_stock', is_hot: true, is_new: false,
    versions: [{ id: '1a', name: 'BLACK Ver.' }, { id: '1b', name: 'PINK Ver.' }]
  },
  {
    id: '2', name: 'GOLDEN', artist: 'Jung Kook', category: 'album',
    base_price: 650, stock_status: 'in_stock', is_hot: true, is_new: true,
    versions: [{ id: '2a', name: 'Solid Ver.' }, { id: '2b', name: 'Shine Ver.' }]
  },
  {
    id: '3', name: 'DRAMA', artist: 'aespa', category: 'album',
    base_price: 520, stock_status: 'in_stock', is_hot: false, is_new: true,
    versions: [{ id: '3a', name: 'Sequence Ver.' }]
  },
  {
    id: '4', name: 'FML', artist: 'SEVENTEEN', category: 'album',
    base_price: 620, stock_status: 'in_stock', is_hot: true, is_new: false,
    versions: [{ id: '4a', name: 'Fight Ver.' }, { id: '4b', name: 'Melt Ver.' }]
  },
  {
    id: '5', name: 'BT21 COOKY 玩偶', artist: 'BT21', category: 'merchandise',
    base_price: 890, stock_status: 'low_stock', is_hot: false, is_new: false,
    versions: [{ id: '5a', name: '標準版' }]
  },
  {
    id: '6', name: 'BLACKPINK 官方手燈', artist: 'BLACKPINK', category: 'merchandise',
    base_price: 1280, stock_status: 'low_stock', is_hot: true, is_new: false,
    versions: [{ id: '6a', name: 'Ver.2' }]
  },
  {
    id: '7', name: 'SPILL THE FEELS', artist: 'STRAY KIDS', category: 'preorder',
    base_price: 550, stock_status: 'preorder', is_hot: false, is_new: true,
    versions: [{ id: '7a', name: 'FEEL Ver.' }, { id: '7b', name: 'SPILL Ver.' }]
  },
  {
    id: '8', name: 'WISH', artist: 'NCT WISH', category: 'preorder',
    base_price: 380, stock_status: 'preorder', is_hot: false, is_new: true,
    versions: [{ id: '8a', name: 'Photobook Ver.' }]
  }
]

const categories = [
  { id: '', name: '全部商品' },
  { id: 'album', name: '專輯' },
  { id: 'merchandise', name: '周邊' },
  { id: 'preorder', name: '預購' }
]

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  const currentCategory = searchParams.get('category') || ''
  const currentSearch = searchParams.get('search') || ''

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await productApi.getProducts({
          category: currentCategory,
          search: currentSearch,
          pageSize: 12
        })
        setProducts(response.products || [])
        setTotal(response.total || 0)
      } catch (error) {
        console.log('Using mock data:', error.message)
        // 使用模擬資料並篩選
        let filtered = [...mockProducts]
        if (currentCategory) {
          filtered = filtered.filter(p => p.category === currentCategory)
        }
        if (currentSearch) {
          const search = currentSearch.toLowerCase()
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.artist.toLowerCase().includes(search)
          )
        }
        setProducts(filtered)
        setTotal(filtered.length)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentCategory, currentSearch])

  const handleCategoryChange = (categoryId) => {
    const newParams = new URLSearchParams(searchParams)
    if (categoryId) {
      newParams.set('category', categoryId)
    } else {
      newParams.delete('category')
    }
    setSearchParams(newParams)
  }

  const getCategoryTitle = () => {
    const cat = categories.find(c => c.id === currentCategory)
    return cat?.name || '全部商品'
  }

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">{getCategoryTitle()}</h1>
          <p className="page-subtitle">
            共 {total} 件商品
          </p>
        </div>

        <div className="page-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3 className="filter-title">商品分類</h3>
              <div className="filter-options">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-option ${currentCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="products-container">
            {loading ? (
              <div className="grid grid-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
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
            ) : products.length > 0 ? (
              <div className="grid grid-3">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>找不到商品</h3>
                <p>試試其他分類或搜尋條件</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductListPage
