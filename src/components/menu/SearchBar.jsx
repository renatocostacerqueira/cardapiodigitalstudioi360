import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar" style={{ marginBottom: 16 }}>
      <Search className="search-bar-icon" />
      <input
        type="text"
        className="input-field"
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}