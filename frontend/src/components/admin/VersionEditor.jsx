import MultiImageUploader from './MultiImageUploader'
import './VersionEditor.css'

function VersionEditor({ versions, onChange, artist = '', productName = '' }) {
  const handleAdd = () => {
    onChange([
      ...versions,
      { name: '', price: 0, stock: 0, sku: '', image_url: '', images: [] }
    ])
  }

  const handleRemove = (index) => {
    const newVersions = versions.filter((_, i) => i !== index)
    onChange(newVersions)
  }

  const handleChange = (index, field, value) => {
    const newVersions = versions.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value }
      }
      return v
    })
    onChange(newVersions)
  }

  const handleImagesChange = (index, images) => {
    const sanitized = (images || []).filter(url => url && url.trim() !== '')
    const newVersions = versions.map((v, i) => {
      if (i === index) {
        return {
          ...v,
          images: sanitized,
          image_url: sanitized[0] || ''
        }
      }
      return v
    })
    onChange(newVersions)
  }

  return (
    <div className="version-editor">
      <div className="version-header">
        <h3>商品版本</h3>
        <button type="button" className="btn-add-version" onClick={handleAdd}>
          + 新增版本
        </button>
      </div>

      {versions.length === 0 ? (
        <p className="no-versions">尚未新增版本。商品至少需要一個版本才能販售。</p>
      ) : (
        <div className="versions-list">
          {versions.map((version, index) => (
            <div key={index} className="version-item">
              <div className="version-fields">
                <div className="field-row">
                  <div className="field">
                    <label>版本名稱 *</label>
                    <input
                      type="text"
                      value={version.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      placeholder="例：A版、B版、隨機版"
                    />
                  </div>
                  <div className="field">
                    <label>SKU *</label>
                    <input
                      type="text"
                      value={version.sku}
                      onChange={(e) => handleChange(index, 'sku', e.target.value)}
                      placeholder="商品編號"
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>價格 *</label>
                    <input
                      type="number"
                      value={version.price}
                      onChange={(e) => handleChange(index, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="field">
                    <label>庫存數量</label>
                    <input
                      type="number"
                      value={version.stock}
                      onChange={(e) => handleChange(index, 'stock', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
                <MultiImageUploader
                  label="版本圖片（最多 5 張）"
                  value={version.images || (version.image_url ? [version.image_url] : [])}
                  onChange={(images) => handleImagesChange(index, images)}
                  artist={artist}
                  productName={productName}
                />
              </div>
              <button
                type="button"
                className="btn-remove-version"
                onClick={() => handleRemove(index)}
              >
                刪除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VersionEditor
