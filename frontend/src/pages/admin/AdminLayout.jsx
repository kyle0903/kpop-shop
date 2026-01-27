import { NavLink, Outlet, Link } from 'react-router-dom'
import './AdminLayout.css'

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Link to="/admin">K-Select 管理後台</Link>
        </div>
        <nav className="admin-nav">
          <NavLink
            to="/admin/products"
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            商品管理
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="back-to-shop">返回商店</Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
