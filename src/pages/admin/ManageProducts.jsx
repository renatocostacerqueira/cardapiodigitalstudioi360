import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ImageOff, Eye, EyeOff, Star } from 'lucide-react';

export default function ManageProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('name'),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('display_order'),
  });

  const [form, setForm] = useState({
    name: '', description: '', image: '', price: '',
    category_id: '', available: true, featured: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, price: parseFloat(data.price) || 0 };
      if (editing) {
        return base44.entities.Product.update(editing.id, payload);
      }
      return base44.entities.Product.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', image: '', price: '', category_id: '', available: true, featured: false });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      image: product.image || '',
      price: product.price?.toString() || '',
      category_id: product.category_id || '',
      available: product.available !== false,
      featured: product.featured || false,
    });
    setEditing(product);
    setShowForm(true);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image: file_url }));
  };

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Products</h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editing ? 'Edit Product' : 'New Product'}
            </h3>
            <div className="input-group">
              <label className="input-label">Name *</label>
              <input className="input-field" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} />
            </div>
            <div className="input-group">
              <label className="input-label">Price (R$) *</label>
              <input className="input-field" type="number" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input-field" value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Image</label>
              <input type="file" accept="image/*" onChange={handleUploadImage}
                style={{ fontSize: 14, color: 'var(--gray-600)' }} />
              {form.image && (
                <img src={form.image} alt="Preview" style={{
                  width: 80, height: 80, objectFit: 'cover',
                  borderRadius: 'var(--radius-md)', marginTop: 8
                }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.available}
                  onChange={e => setForm({ ...form, available: e.target.checked })} />
                Available
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.featured}
                  onChange={e => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate(form)}
                disabled={!form.name || !form.price}>
                {editing ? 'Update' : 'Create'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        products.map(product => (
          <div key={product.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center' }}>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{
                  width: 56, height: 56, objectFit: 'cover',
                  borderRadius: 'var(--radius-md)', flexShrink: 0
                }} />
              ) : (
                <div className="img-placeholder" style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-md)', flexShrink: 0
                }}>
                  <ImageOff style={{ width: 20, height: 20 }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{product.name}</span>
                  {product.featured && <Star style={{ width: 14, height: 14, color: 'var(--yellow-500)', fill: 'var(--yellow-500)' }} />}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--purple-600)' }}>
                  R$ {product.price?.toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: product.available ? 'var(--green-500)' : 'var(--red-500)' }}>
                  {product.available !== false ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="back-btn" onClick={() => startEdit(product)}>
                  <Pencil style={{ width: 16, height: 16 }} />
                </button>
                <button className="back-btn" onClick={() => deleteMutation.mutate(product.id)}
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