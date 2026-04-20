import React from 'react';
import { Plus, X } from 'lucide-react';

/**
 * Renderiza seleção de addons (extras pagos) e remoção de ingredientes para um produto.
 * Controlled: recebe `selectedAddons` (array de {name, price}) e `removedIngredients` (array de strings).
 *
 * Props:
 *  - product: objeto Product (precisa de addons[] e removable_ingredients[])
 *  - selectedAddons, onChangeAddons
 *  - removedIngredients, onChangeRemoved
 *  - compact: layout mais enxuto (modal mobile)
 */
export default function ProductCustomizer({
  product,
  selectedAddons = [],
  onChangeAddons,
  removedIngredients = [],
  onChangeRemoved,
  compact = false,
}) {
  const hasAddons = product?.addons?.length > 0;
  const hasRemovable = product?.removable_ingredients?.length > 0;

  if (!hasAddons && !hasRemovable) return null;

  const toggleAddon = (addon) => {
    const exists = selectedAddons.find(a => a.name === addon.name);
    if (exists) onChangeAddons(selectedAddons.filter(a => a.name !== addon.name));
    else onChangeAddons([...selectedAddons, { name: addon.name, price: Number(addon.price) || 0 }]);
  };

  const toggleIngredient = (name) => {
    if (removedIngredients.includes(name)) onChangeRemoved(removedIngredients.filter(n => n !== name));
    else onChangeRemoved([...removedIngredients, name]);
  };

  const sectionTitleStyle = {
    fontSize: compact ? 12 : 13,
    fontWeight: 700,
    color: 'var(--gray-700)',
    marginBottom: compact ? 8 : 10,
    textTransform: compact ? 'uppercase' : 'none',
    letterSpacing: compact ? '0.05em' : 'normal',
  };

  return (
    <div style={{ marginBottom: compact ? 16 : 22 }}>
      {hasAddons && (
        <div style={{ marginBottom: hasRemovable ? 18 : 0 }}>
          <div style={sectionTitleStyle}>➕ Adicionais (opcionais)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {product.addons.map((addon, i) => {
              const sel = !!selectedAddons.find(a => a.name === addon.name);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleAddon(addon)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: compact ? '10px 12px' : '12px 14px',
                    borderRadius: 'var(--r-md)',
                    border: `1.5px solid ${sel ? 'var(--purple-500)' : 'var(--gray-200)'}`,
                    background: sel ? 'var(--purple-50)' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 'var(--r-xs)',
                      border: `2px solid ${sel ? 'var(--purple-600)' : 'var(--gray-300)'}`,
                      background: sel ? 'var(--purple-600)' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.15s',
                    }}>
                      {sel && <Plus style={{ width: 14, height: 14, color: '#fff', transform: 'rotate(45deg)' }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{addon.name}</span>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 800,
                    color: sel ? 'var(--purple-700)' : 'var(--gray-500)',
                  }}>
                    + R$ {Number(addon.price).toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasRemovable && (
        <div>
          <div style={sectionTitleStyle}>➖ Remover ingredientes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {product.removable_ingredients.map((ing, i) => {
              const removed = removedIngredients.includes(ing);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleIngredient(ing)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px',
                    borderRadius: 'var(--r-full)',
                    border: `1.5px solid ${removed ? 'var(--red-400)' : 'var(--gray-200)'}`,
                    background: removed ? 'var(--red-50)' : '#fff',
                    color: removed ? 'var(--red-600)' : 'var(--gray-700)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                    textDecoration: removed ? 'line-through' : 'none',
                  }}
                >
                  {removed && <X style={{ width: 13, height: 13 }} />}
                  {ing}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}