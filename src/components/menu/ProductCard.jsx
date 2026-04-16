import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      className="product-card animate-fade-in"
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ position: 'relative' }}
    >
      {product.image ? (
        <img src={product.image} alt={product.name} className="product-card-image" />
      ) : (
        <div className="product-card-image img-placeholder">
          <ImageOff style={{ width: 28, height: 28 }} />
        </div>
      )}
      {product.featured && <div className="featured-badge">Featured</div>}
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">
          R$ {product.price?.toFixed(2)}
        </div>
      </div>
    </div>
  );
}