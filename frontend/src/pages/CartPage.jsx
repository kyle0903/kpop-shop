import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cartApi } from '../services/api'
import './CartPage.css'

// 模擬購物車資料
const mockCart = {
  id: 'mock-cart',
  items: [
    {
      id: 'item-1',
      product_id: '1',
      product_name: 'BORN PINK',
      artist: 'BLACKPINK',
      version_id: '1a',
      version_name: 'BLACK Ver.',
      price: 580,
      quantity: 1,
      subtotal: 580
    },
    {
      id: 'item-2',
      product_id: '2',
      product_name: 'GOLDEN',
      artist: 'Jung Kook',
      version_id: '2a',
      version_name: 'Solid Ver.',
      price: 650,
      quantity: 2,
      subtotal: 1300
    }
  ],
  total: 1880,
  item_count: 3
}

function CartPage({ updateCartCount }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const data = await cartApi.getCart()
      setCart(data)
      updateCartCount?.(data.item_count)
    } catch (error) {
      console.log('Using mock data:', error.message)
      setCart(mockCart)
      updateCartCount?.(mockCart.item_count)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    setUpdating(itemId)
    try {
      const updatedCart = await cartApi.updateCartItem(itemId, newQuantity)
      setCart(updatedCart)
      updateCartCount?.(updatedCart.item_count)
    } catch (error) {
      console.log('Failed to update cart:', error.message)
      // 模擬更新
      const newItems = cart.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
          : item
      )
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      setCart({ ...cart, items: newItems, total: newTotal, item_count: newCount })
      updateCartCount?.(newCount)
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (itemId) => {
    setUpdating(itemId)
    try {
      const updatedCart = await cartApi.removeCartItem(itemId)
      setCart(updatedCart)
      updateCartCount?.(updatedCart.item_count)
    } catch (error) {
      console.log('Failed to remove item:', error.message)
      // 模擬刪除
      const newItems = cart.items.filter(item => item.id !== itemId)
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      setCart({ ...cart, items: newItems, total: newTotal, item_count: newCount })
      updateCartCount?.(newCount)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">購物車</h1>
          <div className="cart-layout">
            <div className="cart-items">
              {[1, 2].map(i => (
                <div key={i} className="cart-item skeleton-item">
                  <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">購物車</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>您的購物車是空的</h2>
            <p>探索我們的商品，找到您喜愛的 K-pop 收藏！</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              開始購物
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const shippingFee = cart.total >= 1500 ? 0 : 80

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">購物車</h1>
        
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.id} className={`cart-item ${updating === item.id ? 'updating' : ''}`}>
                <div className="cart-item-image">
                  {item.image_url ? (
                    <img
                      src={`http://localhost:8080${item.image_url}`}
                      alt={item.product_name}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="cart-item-placeholder" style={{ display: item.image_url ? 'none' : 'flex' }}>
                    {item.artist?.charAt(0) || 'K'}
                  </div>
                </div>
                
                <div className="cart-item-details">
                  <p className="cart-item-artist">{item.artist}</p>
                  <h3 className="cart-item-name">{item.product_name}</h3>
                  <p className="cart-item-version">{item.version_name}</p>
                </div>

                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updating === item.id}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={updating === item.id}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-price">
                  <span className="item-subtotal">NT$ {item.subtotal.toLocaleString()}</span>
                  <span className="item-unit-price">NT$ {item.price.toLocaleString()} / 件</span>
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={updating === item.id}
                  aria-label="移除商品"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2 className="summary-title">訂單摘要</h2>
            
            <div className="summary-rows">
              <div className="summary-row">
                <span>商品小計 ({cart.item_count} 件)</span>
                <span>NT$ {cart.total.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>運費</span>
                <span>{shippingFee === 0 ? '免運費' : `NT$ ${shippingFee}`}</span>
              </div>
              {shippingFee > 0 && (
                <div className="shipping-notice">
                  滿 NT$ 1,500 免運費，還差 NT$ {(1500 - cart.total).toLocaleString()}
                </div>
              )}
            </div>

            <div className="summary-total">
              <span>總計</span>
              <span className="total-amount">NT$ {(cart.total + shippingFee).toLocaleString()}</span>
            </div>

            <button className="btn btn-primary btn-lg checkout-btn">
              前往結帳
            </button>

            <Link to="/products" className="continue-shopping">
              ← 繼續購物
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
