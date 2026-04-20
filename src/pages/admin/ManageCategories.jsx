import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import ModalShell from '../../components/admin/ModalShell';

export default function ManageCategories() {
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
  };

  const sortedCategories = [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;

    const reordered = Array.from(sortedCategories);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Atualiza display_order de todos para refletir a nova ordem
    reordered.forEach((cat, idx) => {
      if (cat.display_order !== idx) {
        reorderMutation.mutate({ id: cat.id, display_order: idx });
      }
    });
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div style={{ padding: '32px 36px' }}>
      <div className="panel-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>Categorias</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
            {categories.length} categoria{categories.length !== 1 ? 's' : ''} · arraste para reordenar
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Adicionar Categoria
        </button>
      </div>

      {showForm && (
        <ModalShell title={editing ? 'Editar Categoria' : 'Nova Categoria'} onClose={resetForm} maxWidth={520}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
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
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}>
              {editing ? 'Atualizar' : 'Criar'} Categoria
            </button>
          </div>
        </ModalShell>
      )}

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma categoria ainda</h3>
          <p>Crie a primeira categoria para organizar o cardápio</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {sortedCategories.map((cat, idx) => (
                  <Draggable key={cat.id} draggableId={cat.id} index={idx}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="card"
                        style={{
                          ...prov.draggableProps.style,
                          boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : undefined,
                          background: snapshot.isDragging ? '#fff' : undefined,
                        }}
                      >
                        <div style={{ display: 'flex', padding: '14px 18px', alignItems: 'center', gap: 12 }}>
                          <div
                            {...prov.dragHandleProps}
                            style={{ cursor: 'grab', color: 'var(--gray-300)', display: 'flex', alignItems: 'center', padding: 4 }}
                            title="Arraste para reordenar"
                          >
                            <GripVertical style={{ width: 18, height: 18 }} />
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
                              <span style={{ fontSize: 11, color: 'var(--gray-300)', fontWeight: 500 }}>#{idx + 1}</span>
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}