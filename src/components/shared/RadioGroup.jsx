import React from 'react';

export default function RadioGroup({ options, value, onChange }) {
  return (
    <div className="radio-group">
      {options.map(option => (
        <div
          key={option.value}
          className={`radio-option ${value === option.value ? 'selected' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <div className="radio-dot">
            <div className="radio-dot-inner" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="radio-label">{option.label}</div>
            {option.description && (
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                {option.description}
              </div>
            )}
          </div>
          {option.icon && <span className="radio-icon">{option.icon}</span>}
        </div>
      ))}
    </div>
  );
}