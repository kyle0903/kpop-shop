const API_BASE_URL = 'http://localhost:8080/api'

// 商品相關 API
export const productApi = {
  // 取得商品列表
  async getProducts(params = {}) {
    const query = new URLSearchParams()
    if (params.category) query.append('category', params.category)
    if (params.artist) query.append('artist', params.artist)
    if (params.search) query.append('search', params.search)
    if (params.page) query.append('page', params.page)
    if (params.pageSize) query.append('page_size', params.pageSize)
    
    const response = await fetch(`${API_BASE_URL}/products?${query}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
  },

  // 取得單一商品
  async getProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    return response.json()
  },

  // 取得分類
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  // 取得藝人列表
  async getArtists() {
    const response = await fetch(`${API_BASE_URL}/artists`)
    if (!response.ok) throw new Error('Failed to fetch artists')
    return response.json()
  }
}

// 購物車相關 API
export const cartApi = {
  // 取得購物車
  async getCart() {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch cart')
    return response.json()
  },

  // 新增到購物車
  async addToCart(productId, versionId, quantity = 1) {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        product_id: productId,
        version_id: versionId,
        quantity
      })
    })
    if (!response.ok) throw new Error('Failed to add to cart')
    return response.json()
  },

  // 更新購物車項目
  async updateCartItem(itemId, quantity) {
    const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity })
    })
    if (!response.ok) throw new Error('Failed to update cart item')
    return response.json()
  },

  // 移除購物車項目
  async removeCartItem(itemId) {
    const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to remove cart item')
    return response.json()
  },

  // 清空購物車
  async clearCart() {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to clear cart')
    return response.json()
  }
}

// 管理者 API
export const adminApi = {
  // 建立商品
  async createProduct(data) {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create product')
    return response.json()
  },

  // 更新商品
  async updateProduct(id, data) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update product')
    return response.json()
  },

  // 刪除商品
  async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete product')
    return response.json()
  },

  // 建立版本
  async createVersion(productId, data) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create version')
    return response.json()
  },

  // 更新版本
  async updateVersion(productId, versionId, data) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/versions/${versionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update version')
    return response.json()
  },

  // 刪除版本
  async deleteVersion(productId, versionId) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/versions/${versionId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete version')
    return response.json()
  },

  // 上傳圖片
  async uploadImage(file, artist = '', productName = '') {
    const formData = new FormData()
    formData.append('file', file)
    if (artist) formData.append('artist', artist)
    if (productName) formData.append('product_name', productName)

    const response = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) throw new Error('Failed to upload image')
    return response.json()
  },

  // 上傳多張圖片
  async uploadMultipleImages(files) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    const response = await fetch(`${API_BASE_URL}/admin/upload/multiple`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) throw new Error('Failed to upload images')
    return response.json()
  }
}
