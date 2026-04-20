import React from 'react';
import { PlusCircle, MinusCircle, X } from 'lucide-react';

/**
 * Editor compartilhado para:
 *  - addons: lista de {name, price}
 *  - removable_ingredients: lista de strings
 *
 * Props:
 *  - addons, onChangeAddons
 *  - removable, onChangeRemovable
 */
export default function ProductAddonsEditor({ addons = [], onChangeAddons, removable = [], onChangeRemovable }) {
  const [newIngredient, setNewIngredient] = React.useState('');

  const updateAddon = (i, patch) => {
    const next = [...addons];
    next[i] = { ...next[i], ...patch };
    onChangeAddons(next);
  };
  const addAddon = () => onChangeAddons([...(addons || []), { name: '', price: '' }]);
  const removeAddon = (i) => onChangeAddons(addons.filter((_, idx) => idx !== i));

  const addIngredient = () => {
    const v = newIngredient.trim();
    if (!v) return;
    if (removable.includes(v)) { setNewIngredient(''); return; }
    onChangeRemovable([...(removable || []), v]);
    setNewIngredient('');
  };
  const removeIngredient = (name) => onChangeRemovable(removable.filter(n => n !== name));

  return (
    <div>
      <div className="input-group">
        <label className="input-label">Adicionais (extras pagos)</label>
        {(addons || []).map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input
              className="input-field"
              placeholder="Ex: Bacon extra, Queijo"
              value={a.name}
              onChange={e => updateAddon(i, { name: e.target.value })}
              style={{ flex: 2 }}
            />
            <input
              className="input-field"
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço R$"
              value={a.price}
              onChange={e => updateAddon(i, { price: e.target.value })}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => removeAddon(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-400)', padding: 4, flexShrink: 0 }}
              aria-label="Remover adicional"
            >
              <MinusCircle style={{ width: 18, height: 18 }} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAddon}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed var(--purple-300)', borderRadius: 'var(--r-sm)', padding: '8px 14px', cursor: 'pointer', color: 'var(--purple-600)', fontSize: 13, fontWeight: 600, width: '100%', justifyContent: 'center' }}
        >
          <PlusCircle style={{ width: 15, height: 15 }} /> Adicionar opção
        </button>
      </div>

      <div className="input-group">
        <label className="input-label">Ingredientes removíveis</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="input-field"
            placeholder="Ex: Cebola, Picles"
            value={newIngredient}
            onChange={e => setNewIngredient(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={addIngredient} disabled={!newIngredient.trim()}>
            Adicionar
          </button>
        </div>
        {removable.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {removable.map(ing => (
              <span key={ing} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 'var(--r-full)',
                background: 'var(--gray-100)', color: 'var(--gray-700)',
                fontSize: 12, fontWeight: 600,
              }}>
                {ing}
                <button
                  type="button"
                  onClick={() => removeIngredient(ing)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-500)', padding: 0, display: 'flex', alignItems: 'center' }}
                  aria-label={`Remover ${ing}`}
                >
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}