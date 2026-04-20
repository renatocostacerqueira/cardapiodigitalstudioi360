import React from 'react';
import { motion } from 'framer-motion';

export default function TypeOption({ value, current, onChange, icon: Icon, label, sublabel }) {
  const selected = current === value;
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onChange(value)}
      role="radio"
      aria-checked={selected}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        borderRadius: 'var(--r-md)', cursor: 'pointer',
        border: `1.5px solid ${selected ? 'var(--purple-400)' : 'var(--gray-150)'}`,
        background: selected ? 'var(--purple-50)' : '#fff',
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: 10,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 'var(--r-sm)', flexShrink: 0,
        background: selected ? 'var(--purple-100)' : 'var(--gray-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}>
        <Icon style={{ width: 20, height: 20, color: selected ? 'var(--purple-600)' : 'var(--gray-400)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>{sublabel}</div>}
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: 'var(--r-full)',
        border: `2px solid ${selected ? 'var(--purple-600)' : 'var(--gray-300)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: 'var(--r-full)', background: 'var(--purple-600)' }} />}
      </div>
    </motion.div>
  );
}