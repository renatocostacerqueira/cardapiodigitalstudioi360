import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function ManageCategories() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', display_order: 0, active: true });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => base44.entities.Category.list('display_order'),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, display_order: parseInt(data.display_order) || 0 };
      if (editing) return base44.entities.Category.update(editing.id, payload);
      return base44.entities.Category.create(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Category.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, display_order }) => base44.entities.Category.update(id, { display_order }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', display_order: 0, active: true });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name || '', description: cat.description || '', display_order: cat.display_order || 0, active: cat.active !== false });
    setEditing(cat);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moveOrder = (cat, direction) => {
    const sorted = [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const idx = sorted.findIndex(c => c.id === cat.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapCat = sorted[swapIdx];
    const myOrder = cat.display_order || 0;
    const swapOrder = swapCat.display_order || 0;
    reorderMutation.mutate({ id: cat.id, display_order: swapOrder });
    reorderMutation.mutate({ id: swapCat.id, display_order: myOrder });
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>Categorias</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{categories.length} categoria{categories.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(v => !v); }}>
          <Plus style={{ width: 16, height: 16 }} /> Adicionar Categoria
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>
                {editing ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Nome *</label>
                <input className="input-field" value={form.name} onChange={f('name')} placeholder="Nome da categoria" />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Ordem de Exibição</label>
                <input className="input-field" type="number" value={form.display_order} onChange={f('display_order')} />
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 14 }}>
              <label className="input-label">Descrição</label>
              <textarea className="input-field" value={form.description} onChange={f('description')} rows={2} placeholder="Descrição opcional" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 18px' }}>
              <div
                onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}
                style={{ width: 38, height: 22, borderRadius: 'var(--r-full)', background: form.active ? 'var(--green-500)' : 'var(--gray-300)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <div style={{ position: 'absolute', top: 2, left: form.active ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
                {form.active ? 'Ativa — visível no cardápio' : 'Inativa — oculta do cardápio'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}>
                {editing ? 'Atualizar' : 'Criar'} Categoria
              </button>
              <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma categoria ainda</h3>
          <p>Crie a primeira categoria para organizar o cardápio</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((cat, idx, arr) => (
            <div key={cat.id} className="card">
              <div style={{ display: 'flex', padding: '14px 18px', alignItems: 'center', gap: 12 }}>
                {/* Reorder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    disabled={idx === 0}
                    onClick={() => moveOrder(cat, -1)}
                    style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: 2, opacity: idx === 0 ? 0.3 : 1, color: 'var(--gray-400)' }}
                  >
                    <ChevronUp style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    disabled={idx === arr.length - 1}
                    onClick={() => moveOrder(cat, 1)}
                    style={{ background: 'none', border: 'none', cursor: idx === arr.length - 1 ? 'not-allowed' : 'pointer', padding: 2, opacity: idx === arr.length - 1 ? 0.3 : 1, color: 'var(--gray-400)' }}
                  >
                    <ChevronDown style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)' }}>{cat.name}</span>
                    <span style={{
                      fontSize: 10, padding: '2px 9px', borderRadius: 'var(--r-full)', fontWeight: 700,
                      background: cat.active !== false ? 'var(--green-50)' : 'var(--red-50)',
                      color: cat.active !== false ? 'var(--green-600)' : 'var(--red-500)',
                    }}>
                      {cat.active !== false ? 'Ativa' : 'Inativa'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--gray-300)', fontWeight: 500 }}>#{cat.display_order || 0}</span>
                  </div>
                  {cat.description && (
                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 3 }}>{cat.description}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    className="back-btn"
                    onClick={() => toggleMutation.mutate({ id: cat.id, active: cat.active === false })}
                    title={cat.active !== false ? 'Desativar' : 'Ativar'}
                    style={{ color: cat.active !== false ? 'var(--green-500)' : 'var(--gray-400)', fontSize: 10, fontWeight: 700 }}
                  >
                    {cat.active !== false ? 'ON' : 'OFF'}
                  </button>
                  <button className="back-btn" onClick={() => startEdit(cat)}>
                    <Pencil style={{ width: 15, height: 15 }} />
                  </button>
                  <button
                    className="back-btn"
                    style={{ color: 'var(--red-500)' }}
                    onClick={() => { if (window.confirm(`Excluir "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
                  >
                    <Trash2 style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}