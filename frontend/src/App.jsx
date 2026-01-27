import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import AdminLayout from "./pages/admin/AdminLayout";
import ProductListAdmin from "./pages/admin/ProductListAdmin";
import ProductFormPage from "./pages/admin/ProductFormPage";
import "./index.css";

function App() {
  const [cartItemCount, setCartItemCount] = useState(0);

  const updateCartCount = (count) => {
    setCartItemCount(count);
  };

  return (
    <Router>
      <Routes>
        {/* 管理者路由 - 不使用 Header/Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<ProductListAdmin />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
        </Route>

        {/* 前台路由 */}
        <Route
          path="*"
          element={
            <div className="page">
              <Header cartItemCount={cartItemCount} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route
                    path="/products/:id"
                    element={<ProductDetailPage updateCartCount={updateCartCount} />}
                  />
                  <Route
                    path="/cart"
                    element={<CartPage updateCartCount={updateCartCount} />}
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
