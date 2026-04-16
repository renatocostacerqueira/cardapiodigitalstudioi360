import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/menu/SearchBar';
import CategoryPills from '../components/menu/CategoryPills';
import BottomNav from '../components/menu/BottomNav';
import { UtensilsCrossed, ImageOff, Star } from 'lucide-react';

function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <div
      className="product-card animate-fade-in"
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ position: 'relative' }}
    >
      <div className="product-card-image-wrap">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            width="200"
            height="200"
          />
        ) : (
          <div className="img-placeholder" style={{ width: '100%', aspectRatio: '1' }}>
            <ImageOff style={{ width: 28, height: 28 }} />
          </div>
        )}
        {product.featured && <div className="featured-badge">⭐ Popular</div>}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Star style={{ width: 11, height: 11, fill: '#eab308', color: '#eab308' }} />
          <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>4.8</span>
        </div>
        <div className="product-card-price">R$ {product.price?.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default function MenuHome() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ active: true }, 'display_order'),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ available: true }),
  });

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !activeCategory || p.category_id === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featured = products.filter(p => p.featured);

  return (
    <div className="app-shell">
      <div className="page-container">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingTop: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple-400)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
              Good food, fast delivery
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
              What would you<br />like to eat? 🍽️
            </h1>
          </div>
          <div style={{
            width: 46, height: 46, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 4, boxShadow: '0 4px 14px rgba(109,40,217,0.30)',
          }}>
            <UtensilsCrossed style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search dishes..." />

        <CategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {isLoading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UtensilsCrossed />
            <h3>No items found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <>
            {!search && !activeCategory && featured.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 className="section-title" style={{ margin: 0 }}>Popular Now</h2>
                  <span style={{ fontSize: 12, color: 'var(--purple-500)', fontWeight: 600, cursor: 'pointer' }}>See all</span>
                </div>
                <div className="product-grid">
                  {featured.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                {activeCategory
                  ? categories.find(c => c.id === activeCategory)?.name || 'Items'
                  : (search ? 'Results' : 'All Items')}
              </h2>
              <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 500 }}>
                {filtered.length} items
              </span>
            </div>

            <div className="product-grid">
              {filtered
                .filter(p => !(!search && !activeCategory && p.featured))
                .map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}