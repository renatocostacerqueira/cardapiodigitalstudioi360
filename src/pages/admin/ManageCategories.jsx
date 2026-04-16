import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', display_order: 0, active: true });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (cat) => {
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      display_order: cat.display_order || 0,
      active: cat.active !== false,
    });
    setEditing(cat);
    setShowForm(true);
  };

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Categories</h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editing ? 'Edit Category' : 'New Category'}
            </h3>
            <div className="input-group">
              <label className="input-label">Name *</label>
              <input className="input-field" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional description" />
            </div>
            <div className="input-group">
              <label className="input-label">Display Order</label>
              <input className="input-field" type="number" value={form.display_order}
                onChange={e => setForm({ ...form, display_order: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>
              <input type="checkbox" checked={form.active}
                onChange={e => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate(form)}
                disabled={!form.name}>
                {editing ? 'Update' : 'Create'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <h3>No categories yet</h3>
          <p>Create your first category to organize the menu</p>
        </div>
      ) : (
        categories.map(cat => (
          <div key={cat.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', padding: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{cat.name}</span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: cat.active !== false ? 'var(--green-50)' : 'var(--red-50)',
                    color: cat.active !== false ? 'var(--green-500)' : 'var(--red-500)',
                    fontWeight: 600,
                  }}>
                    {cat.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {cat.description && (
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                    {cat.description}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                  Order: {cat.display_order || 0}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="back-btn" onClick={() => startEdit(cat)}>
                  <Pencil style={{ width: 16, height: 16 }} />
                </button>
                <button className="back-btn" onClick={() => deleteMutation.mutate(cat.id)}
                  style={{ color: 'var(--red-500)' }}>
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}