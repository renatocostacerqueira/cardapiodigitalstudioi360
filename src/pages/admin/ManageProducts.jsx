import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ImageOff, Star, Eye, EyeOff, Search, Loader2, X } from 'lucide-react';

function ProductForm({ form, setForm, editing, onSave, onCancel, saving, categories }) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image: file_url }));
    setUploadingImage(false);
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>
            {editing ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div>
            <div className="input-group">
              <label className="input-label">Nome *</label>
              <input className="input-field" value={form.name} onChange={f('name')} placeholder="Nome do produto" />
            </div>
            <div className="input-group">
              <label className="input-label">Descrição</label>
              <textarea className="input-field" value={form.description} onChange={f('description')} placeholder="Descrição" rows={3} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Preço (R$) *</label>
                <input className="input-field" type="number" step="0.01" min="0" value={form.price} onChange={f('price')} placeholder="0.00" />
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select className="input-field" value={form.category_id} onChange={f('category_id')}>
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="input-group">
              <label className="input-label">Imagem do Produto</label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {form.image ? (
                  <img src={form.image} alt="Preview" style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '2px solid var(--gray-150)', flexShrink: 0 }} />
                ) : (
                  <div className="img-placeholder" style={{ width: 88, height: 88, borderRadius: 'var(--r-md)', flexShrink: 0 }}>
                    <ImageOff style={{ width: 24, height: 24 }} />
                  </div>
                )}
                <div>
                  <label style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                    <span className="btn btn-outline btn-sm" style={{ display: 'inline-flex', pointerEvents: 'none' }}>
                      {uploadingImage ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 0.65s linear infinite' }} /> : null}
                      {uploadingImage ? 'Enviando…' : 'Enviar Imagem'}
                    </span>
                  </label>
                  {form.image && (
                    <button onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      style={{ display: 'block', marginTop: 8, fontSize: 12, color: 'var(--red-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Remover imagem
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div
                  onClick={() => setForm(prev => ({ ...prev, available: !prev.available }))}
                  style={{ width: 38, height: 22, borderRadius: 'var(--r-full)', background: form.available ? 'var(--green-500)' : 'var(--gray-300)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ position: 'absolute', top: 2, left: form.available ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>Disponível</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div
                  onClick={() => setForm(prev => ({ ...prev, featured: !prev.featured }))}
                  style={{ width: 38, height: 22, borderRadius: 'var(--r-full)', background: form.featured ? 'var(--yellow-500)' : 'var(--gray-300)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ position: 'absolute', top: 2, left: form.featured ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>Destaque</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={onSave} disabled={!form.name || !form.price || saving}>
                {saving ? 'Salvando...' : editing ? 'Atualizar Produto' : 'Criar Produto'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState({ name: '', description: '', image: '', price: '', category_id: '', available: true, featured: false });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('name'),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('display_order'),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, price: parseFloat(data.price) || 0 };
      if (editing) return base44.entities.Product.update(editing.id, payload);
      return base44.entities.Product.create(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, available }) => base44.entities.Product.update(id, { available }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', image: '', price: '', category_id: '', available: true, featured: false });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (product) => {
    setForm({
      name: product.name || '', description: product.description || '',
      image: product.image || '', price: product.price?.toString() || '',
      category_id: product.category_id || '', available: product.available !== false,
      featured: product.featured || false,
    });
    setEditing(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category_id === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>Produtos</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{products.length} produtos no total</p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus style={{ width: 16, height: 16 }} /> Adicionar Produto
        </button>
      </div>

      {showForm && (
        <ProductForm
          form={form} setForm={setForm} editing={editing}
          onSave={() => saveMutation.mutate(form)} onCancel={resetForm}
          saving={saveMutation.isPending} categories={categories}
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ margin: 0, flex: 1, minWidth: 200 }}>
          <Search className="search-bar-icon" />
          <input className="input-field" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Todas as Categorias</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum produto encontrado</h3>
          <p>Adicione seu primeiro produto ou ajuste os filtros</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map(product => (
            <div key={product.id} className="card" style={{ transition: 'box-shadow 0.15s' }}>
              <div style={{ display: 'flex', gap: 14, padding: '14px 18px', alignItems: 'center' }}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--r-md)', flexShrink: 0, border: '1px solid var(--gray-100)' }} />
                ) : (
                  <div className="img-placeholder" style={{ width: 64, height: 64, borderRadius: 'var(--r-md)', flexShrink: 0 }}>
                    <ImageOff style={{ width: 20, height: 20 }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>{product.name}</span>
                    {product.featured && <Star style={{ width: 13, height: 13, color: 'var(--yellow-500)', fill: 'var(--yellow-500)' }} />}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: product.available !== false ? 'var(--green-50)' : 'var(--red-50)',
                      color: product.available !== false ? 'var(--green-600)' : 'var(--red-500)',
                    }}>
                      {product.available !== false ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  {product.category_id && (
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                      {categoryMap[product.category_id] || 'Sem categoria'}
                    </div>
                  )}
                  {product.description && (
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                      {product.description}
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--purple-600)', marginTop: 4, letterSpacing: '-0.02em' }}>
                    R$ {product.price?.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleMutation.mutate({ id: product.id, available: product.available === false })}
                    className="back-btn"
                    title={product.available !== false ? 'Marcar indisponível' : 'Marcar disponível'}
                    style={{ color: product.available !== false ? 'var(--green-500)' : 'var(--gray-400)' }}
                  >
                    {product.available !== false ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
                  </button>
                  <button className="back-btn" onClick={() => startEdit(product)}>
                    <Pencil style={{ width: 15, height: 15 }} />
                  </button>
                  <button
                    className="back-btn"
                    style={{ color: 'var(--red-500)' }}
                    onClick={() => {
                      if (window.confirm(`Excluir "${product.name}"?`)) deleteMutation.mutate(product.id);
                    }}
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