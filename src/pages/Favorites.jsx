import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart, ArrowLeft, ImageOff } from 'lucide-react';
import FavoriteButton from '../components/product/FavoriteButton';
import ProductRatingBadge from '../components/product/ProductRatingBadge';

export default function Favorites() {
  const navigate = useNavigate();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date'),
  });

  const productIds = favorites.map(f => f.product_id);

  const { data: products = [] } = useQuery({
    queryKey: ['favorite-products', productIds.join(',')],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const all = await base44.entities.Product.list();
      return all.filter(p => productIds.includes(p.id));
    },
    enabled: productIds.length > 0,
  });

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingBottom: 140 }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Meus Favoritos</h1>
            <p className="page-subtitle">{favorites.length} {favorites.length === 1 ? 'produto salvo' : 'produtos salvos'}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Heart style={{ width: 48, height: 48, color: 'var(--gray-200)' }} />
            <h3>Nenhum favorito ainda</h3>
            <p>Toque no coração dos produtos que você gosta para salvá-los aqui</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
              Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => (
              <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)} style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                  <FavoriteButton productId={p.id} size={16} style={{ width: 34, height: 34 }} />
                </div>
                <div className="product-card-image-wrap">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="product-card-image" />
                  ) : (
                    <div className="img-placeholder" style={{ width: '100%', aspectRatio: '1' }}>
                      <ImageOff style={{ width: 28, height: 28 }} />
                    </div>
                  )}
                </div>
                <div className="product-card-body">
                  <div className="product-card-name">{p.name}</div>
                  <div style={{ marginTop: 4 }}>
                    <ProductRatingBadge productId={p.id} size={11} />
                  </div>
                  <div className="product-card-price">
                    {p.has_variations && p.variations?.length > 0
                      ? `A partir de R$ ${Math.min(...p.variations.map(v => v.price)).toFixed(2)}`
                      : `R$ ${p.price?.toFixed(2)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}