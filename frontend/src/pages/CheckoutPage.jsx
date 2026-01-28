import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartApi, orderApi } from '../services/api'
import './CheckoutPage.css'

function CheckoutPage({ updateCartCount }) {
    const navigate = useNavigate()
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        postal_code: '',
        note: '',
        payment_method: 'credit_card'
    })

    useEffect(() => {
        fetchCart()
    }, [])

    const fetchCart = async () => {
        try {
            const data = await cartApi.getCart()
            if (!data || data.item_count === 0) {
                navigate('/cart')
                return
            }
            setCart(data)
        } catch (error) {
            console.error('Failed to fetch cart:', error)
            navigate('/cart')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const orderData = {
                shipping_info: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postal_code,
                    note: formData.note
                },
                payment_method: formData.payment_method
            }

            await orderApi.createOrder(orderData)

            // 更新購物車數量為 0
            updateCartCount?.(0)

            alert('訂單建立成功！')
            navigate('/')
        } catch (error) {
            console.error('Failed to create order:', error)
            alert('建立訂單失敗，請稍後再試')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="container">載入中...</div>
    if (!cart) return null

    const shippingFee = cart.total >= 1500 ? 0 : 80
    const total = cart.total + shippingFee

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="page-title">結帳</h1>

                <div className="checkout-layout">
                    {/* 左側：表單 */}
                    <div className="checkout-form-section">
                        <form id="checkout-form" onSubmit={handleSubmit}>
                            <section className="form-section">
                                <h2>收件人資訊</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>姓名</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>電話</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="form-section">
                                <h2>配送地址</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>城市/縣市</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>郵遞區號</label>
                                        <input
                                            type="text"
                                            name="postal_code"
                                            required
                                            value={formData.postal_code}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>詳細地址</label>
                                        <input
                                            type="text"
                                            name="address"
                                            required
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="區、街道、門牌號麻"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>備註 (選填)</label>
                                        <textarea
                                            name="note"
                                            value={formData.note}
                                            onChange={handleInputChange}
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="form-section">
                                <h2>付款方式</h2>
                                <div className="payment-methods">
                                    <label className={`payment-option ${formData.payment_method === 'credit_card' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="credit_card"
                                            checked={formData.payment_method === 'credit_card'}
                                            onChange={handleInputChange}
                                        />
                                        <span>信用卡付款</span>
                                    </label>
                                    <label className={`payment-option ${formData.payment_method === 'transfer' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="transfer"
                                            checked={formData.payment_method === 'transfer'}
                                            onChange={handleInputChange}
                                        />
                                        <span>銀行轉帳</span>
                                    </label>
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* 右側：訂單摘要 */}
                    <div className="checkout-summary">
                        <div className="summary-card">
                            <h2>訂單摘要</h2>
                            <div className="summary-items">
                                {cart.items.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div className="item-info">
                                            <span className="item-name">{item.product_name}</span>
                                            <span className="item-version">{item.version_name} x {item.quantity}</span>
                                        </div>
                                        <span className="item-price">NT$ {item.subtotal.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>小計</span>
                                    <span>NT$ {cart.total.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>運費</span>
                                    <span>{shippingFee === 0 ? '免運費' : `NT$ ${shippingFee}`}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>總計</span>
                                    <span>NT$ {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="btn btn-primary btn-lg place-order-btn"
                                disabled={submitting}
                            >
                                {submitting ? '處理中...' : '確認下單'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage
