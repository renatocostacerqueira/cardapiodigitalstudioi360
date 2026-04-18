import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/menu/SearchBar';
import CategoryPills from '../components/menu/CategoryPills';
import FloatingCartButton from '../components/menu/FloatingCartButton';
import { UtensilsCrossed, ImageOff, Star, Zap, Clock, ShieldCheck } from 'lucide-react';

function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
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
      marginBottom: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Decorative circles */}
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

      <div style={{ fontSize: 80, position: 'relative', zIndex: 1, flexShrink: 0 }}>
        🍽️
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
  const nonFeaturedFiltered = filtered.filter(p => !(!search && !activeCategory && p.featured));

  return (
    <>
      {/* ===== MOBILE layout (≤1023px) ===== */}
      <div className="mobile-menu-view">
        <div className="app-shell">
          <div className="page-container" style={{ paddingBottom: 140 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingTop: 12 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple-400)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Boa comida, entrega rápida
                </p>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
                  O que você quer<br />comer hoje? 🍽️
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <h2 className="section-title" style={{ margin: 0 }}>Mais Pedidos</h2>
                    </div>
                    <div className="product-grid">
                      {featured.map(p => <ProductCard key={p.id} product={p} />)}
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
                  {nonFeaturedFiltered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP layout (≥1024px) ===== */}
      <div className="desktop-menu-view">
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>

          {/* Left sidebar — categories */}
          <aside style={{
            width: 220, flexShrink: 0, background: '#fff',
            borderRight: '1px solid var(--gray-150)',
            padding: '32px 16px',
            position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 24px', borderBottom: '1px solid var(--gray-100)', marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UtensilsCrossed style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>Cardápio</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 10 }}>
              Categorias
            </div>
            {[{ id: null, name: 'Todos os Itens' }, ...categories].map(cat => (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', width: '100%',
                  padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                  background: activeCategory === cat.id ? 'var(--purple-50)' : 'transparent',
                  color: activeCategory === cat.id ? 'var(--purple-700)' : 'var(--gray-500)',
                  fontWeight: activeCategory === cat.id ? 700 : 500,
                  fontSize: 13, border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                  transition: 'background 0.15s, color 0.15s',
                  position: 'relative',
                }}
              >
                {activeCategory === cat.id && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: 'var(--purple-600)' }} />
                )}
                {cat.name}
              </button>
            ))}
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, padding: '40px 48px 80px', minWidth: 0 }}>
            <HeroBanner />

            {/* Search bar */}
            <div style={{ maxWidth: 500, marginBottom: 32 }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar pratos..." />
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
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', margin: 0 }}>
                        ⭐ Mais Pedidos
                      </h2>
                      <span style={{ fontSize: 13, color: 'var(--purple-500)', fontWeight: 600 }}>
                        {featured.length} destaques
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                      {featured.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', margin: 0 }}>
                    {activeCategory ? categories.find(c => c.id === activeCategory)?.name || 'Items' : (search ? 'Resultados' : 'Todos os Itens')}
                  </h2>
                  <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 500 }}>{filtered.length} itens</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                  {nonFeaturedFiltered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating cart button — visible on both mobile and desktop */}
      <FloatingCartButton />

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