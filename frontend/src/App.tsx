import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
