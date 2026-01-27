import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productApi, adminApi } from '../../services/api'
import './ProductListAdmin.css'

const CATEGORY_MAP = {
  album: '專輯',
  merchandise: '周邊',
  preorder: '預購'
}

const STOCK_STATUS_MAP = {
  in_stock: { text: '有庫存', className: 'status-in-stock' },
  low_stock: { text: '庫存不足', className: 'status-low-stock' },
  out_of_stock: { text: '缺貨', className: 'status-out-of-stock' },
  preorder: { text: '預購中', className: 'status-preorder' }
}

function ProductListAdmin() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { page, pageSize: 10 }
      if (search) params.search = search
      if (category) params.category = category

      const result = await productApi.getProducts(params)
      setProducts(result.products || [])
      setTotalPages(result.total_pages || 1)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, category])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const handleDelete = async (product) => {
    try {
      await adminApi.deleteProduct(product.id)
      setDeleteConfirm(null)
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('刪除失敗')
    }
  }

  return (
    <div className="product-list-admin">
      <div className="page-header">
        <h1>商品管理</h1>
        <Link to="/admin/products/new" className="btn-primary">
          + 新增商品
        </Link>
      </div>

      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="搜尋商品名稱或藝人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">搜尋</button>
        </form>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
          <option value="">全部分類</option>
          <option value="album">專輯</option>
          <option value="merchandise">周邊</option>
          <option value="preorder">預購</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">載入中...</div>
      ) : products.length === 0 ? (
        <div className="empty">沒有找到商品</div>
      ) : (
        <>
          <table className="product-table">
            <thead>
              <tr>
                <th>圖片</th>
                <th>商品名稱</th>
                <th>藝人</th>
                <th>分類</th>
                <th>價格</th>
                <th>庫存狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image_url ? `http://localhost:8080${product.image_url}` : '/placeholder.png'}
                      alt={product.name}
                      className="product-thumb"
                    />
                  </td>
                  <td>
                    <div className="product-name">
                      {product.name}
                      {product.is_hot && <span className="badge hot">HOT</span>}
                      {product.is_new && <span className="badge new">NEW</span>}
                    </div>
                  </td>
                  <td>{product.artist}</td>
                  <td>{CATEGORY_MAP[product.category] || product.category}</td>
                  <td>NT${product.base_price}</td>
                  <td>
                    <span className={`stock-status ${STOCK_STATUS_MAP[product.stock_status]?.className || ''}`}>
                      {STOCK_STATUS_MAP[product.stock_status]?.text || product.stock_status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/admin/products/${product.id}/edit`} className="btn-edit">
                        編輯
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(product)}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一頁
              </button>
              <span>第 {page} / {totalPages} 頁</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                下一頁
              </button>
            </div>
          )}
        </>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>確認刪除</h3>
            <p>確定要刪除「{deleteConfirm.name}」嗎？此操作無法復原。</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                取消
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm)}>
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductListAdmin
