import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import "./index.css";

function App() {
  const [cartItemCount, setCartItemCount] = useState(0);

  const updateCartCount = (count) => {
    setCartItemCount(count);
  };

  return (
    <Router>
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
    </Router>
  );
}

export default App;
