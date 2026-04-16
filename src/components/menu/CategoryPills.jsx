import React from 'react';

export default function CategoryPills({ categories, activeId, onSelect }) {
  return (
    <div className="pill-list" style={{ marginBottom: 16 }}>
      <button
        className={`pill ${!activeId ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`pill ${activeId === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}