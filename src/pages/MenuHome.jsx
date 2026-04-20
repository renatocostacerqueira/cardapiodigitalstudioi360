import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/menu/SearchBar';
import CategoryPills from '../components/menu/CategoryPills';
import FloatingCartButton from '../components/menu/FloatingCartButton';
import ProductModal from '../components/menu/ProductModal';
import { UtensilsCrossed, ImageOff, Star, Zap, Clock, ShieldCheck, Lock } from 'lucide-react';
import RestaurantHeader from '../components/menu/RestaurantHeader';
import ClosedBanner from '../components/menu/ClosedBanner';

function ProductCard({ product, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="product-card"
      onClick={() => onClick(product)}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <div className="product-card-image-wrap">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card-image" loading="lazy" width="200" height="200" />
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
        <div className="product-card-price">
          {product.has_variations && product.variations?.length > 0
            ? `A partir de R$ ${Math.min(...product.variations.map(v => v.price)).toFixed(2)}`
            : `R$ ${product.price?.toFixed(2)}`}
        </div>
      </div>
    </motion.div>
  );
}

function HeroBanner() {
  return (
    <div style={{
      borderRadius: 'var(--r-2xl)',
      background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 55%, #7c3aed 100%)',
      padding: '40px 44px',
      marginBottom: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: -40, right: 200, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -60, right: 80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          🔥 Entrega em até 30 minutos
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 16 }}>
          O que você quer<br />comer hoje?
        </h1>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { icon: Zap, label: 'Entrega Rápida' },
            { icon: Clock, label: 'Acompanhe ao Vivo' },
            { icon: ShieldCheck, label: 'Pagamento Seguro' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>
              <Icon style={{ width: 14, height: 14 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 80, position: 'relative', zIndex: 1, flexShrink: 0 }}>🍽️</div>
    </div>
  );
}

export default function MenuHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleProductClick = (product) => {
    if (isDesktop) {
      setModalProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ active: true }, 'display_order'),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ available: true }),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant-menu-home'],
    queryFn: () => base44.entities.Restaurant.list(),
  });
  const restaurant = restaurants[0];
  const isClosed = restaurant && restaurant.active === false;

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !activeCategory || p.category_id === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featured = products.filter(p => p.featured);
  const nonFeaturedFiltered = filtered.filter(p => !(!search && !activeCategory && p.featured));

  const productGrid = (items) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
      {items.map(p => <ProductCard key={p.id} product={p} onClick={handleProductClick} />)}
    </div>
  );

  return (
    <>
      {/* ===== MOBILE (≤1023px) ===== */}
      <div className="mobile-menu-view">
        <div className="app-shell">
          <div className="page-container" style={{ paddingBottom: 140 }}>
            <RestaurantHeader restaurant={restaurant} variant="mobile" />
            {isClosed && <ClosedBanner />}
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar pratos..." />
            <CategoryPills categories={categories} activeId={activeCategory} onSelect={setActiveCategory} />
            {isLoading ? (
              <div className="loading-container"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <UtensilsCrossed />
                <h3>Nenhum item encontrado</h3>
                <p>Tente uma busca diferente ou outra categoria</p>
              </div>
            ) : (
              <>
                {!search && !activeCategory && featured.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <h2 className="section-title">Mais Pedidos</h2>
                    <div className="product-grid">
                      {featured.map(p => <ProductCard key={p.id} product={p} onClick={handleProductClick} />)}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 className="section-title" style={{ margin: 0 }}>
                    {activeCategory ? categories.find(c => c.id === activeCategory)?.name || 'Items' : (search ? 'Resultados' : 'Todos os Itens')}
                  </h2>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 500 }}>{filtered.length} items</span>
                </div>
                <div className="product-grid">
                  {nonFeaturedFiltered.map(p => <ProductCard key={p.id} product={p} onClick={handleProductClick} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP (≥1024px) ===== */}
      <div className="desktop-menu-view">
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '40px 48px 80px', maxWidth: 1280, margin: '0 auto' }}>
          {restaurant?.name
            ? <RestaurantHeader restaurant={restaurant} variant="desktop" />
            : <HeroBanner />}
          {isClosed && <ClosedBanner />}

          {/* Search + Categories row */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ maxWidth: 500, marginBottom: 16 }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar pratos..." />
            </div>
            <CategoryPills categories={categories} activeId={activeCategory} onSelect={setActiveCategory} />
          </div>

          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <UtensilsCrossed />
              <h3>Nenhum item encontrado</h3>
              <p>Tente uma busca diferente ou outra categoria</p>
            </div>
          ) : (
            <>
              {!search && !activeCategory && featured.length > 0 && (
                <div style={{ marginBottom: 44 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', margin: 0 }}>⭐ Mais Pedidos</h2>
                    <span style={{ fontSize: 13, color: 'var(--purple-500)', fontWeight: 600 }}>{featured.length} destaques</span>
                  </div>
                  {productGrid(featured)}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', margin: 0 }}>
                  {activeCategory ? categories.find(c => c.id === activeCategory)?.name || 'Items' : (search ? 'Resultados' : 'Todos os Itens')}
                </h2>
                <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 500 }}>{filtered.length} itens</span>
              </div>
              {productGrid(nonFeaturedFiltered)}
            </>
          )}
        </div>
      </div>

      {/* Modal — desktop only */}
      {isDesktop && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}

      {!isClosed && <FloatingCartButton />}

      <style>{`
        .mobile-menu-view { display: block; }
        .desktop-menu-view { display: none; }

        @media (min-width: 1024px) {
          .mobile-menu-view { display: none; }
          .desktop-menu-view { display: block; }
        }
      `}</style>
    </>
  );
}