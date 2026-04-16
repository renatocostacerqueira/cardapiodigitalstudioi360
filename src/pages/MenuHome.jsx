import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '../components/menu/SearchBar';
import CategoryPills from '../components/menu/CategoryPills';
import ProductCard from '../components/menu/ProductCard';
import BottomNav from '../components/menu/BottomNav';
import { UtensilsCrossed } from 'lucide-react';

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
        <div style={{ marginBottom: 20, paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <UtensilsCrossed style={{ width: 24, height: 24, color: 'var(--purple-600)' }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>Our Menu</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            Fresh & delicious, made with love
          </p>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search dishes..." />

        <CategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UtensilsCrossed />
            <h3>No items found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        ) : (
          <>
            {!search && !activeCategory && featured.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h2 className="section-title">⭐ Featured</h2>
                <div className="product-grid">
                  {featured.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 8 }}>
              <h2 className="section-title">
                {activeCategory
                  ? categories.find(c => c.id === activeCategory)?.name || 'Items'
                  : 'All Items'
                }
              </h2>
            </div>

            <div className="product-grid">
              {filtered.filter(p => !(!search && !activeCategory && p.featured)).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}