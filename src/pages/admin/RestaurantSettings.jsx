import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ImageOff, Store, Phone, MapPin, Clock, DollarSign, Loader2 } from 'lucide-react';

const DEFAULT_FORM = {
  name: '', description: '', phone: '', address: '',
  delivery_fee: '', avg_prep_time: '', active: true, logo: '',
};

export default function RestaurantSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [restaurantId, setRestaurantId] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurant-settings'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  useEffect(() => {
    if (restaurants.length > 0) {
      const r = restaurants[0];
      setRestaurantId(r.id);
      setForm({
        name: r.name || '',
        description: r.description || '',
        phone: r.phone || '',
        address: r.address || '',
        delivery_fee: r.delivery_fee?.toString() || '',
        avg_prep_time: r.avg_prep_time?.toString() || '',
        active: r.active !== false,
        logo: r.logo || '',
      });
    }
  }, [restaurants]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        delivery_fee: parseFloat(data.delivery_fee) || 0,
        avg_prep_time: parseInt(data.avg_prep_time) || 30,
      };
      if (restaurantId) {
        return base44.entities.Restaurant.update(restaurantId, payload);
      }
      return base44.entities.Restaurant.create(payload);
    },
    onSuccess: (result) => {
      if (!restaurantId) setRestaurantId(result.id);
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, logo: file_url }));
    setUploadingLogo(false);
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  if (isLoading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
              Configurações do Restaurante
            </h1>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {restaurantId ? 'Edite as informações do restaurante' : 'Configure seu restaurante'}
            </p>
          </div>
        </div>
        <button
          className={`btn btn-sm ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending || !form.name}
        >
          <Save style={{ width: 15, height: 15 }} />
          {saveMutation.isPending ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>

        {/* Basic Info */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Store style={{ width: 18, height: 18, color: 'var(--purple-600)' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>Informações Básicas</h2>
            </div>

            {/* Logo */}
            <div className="input-group">
              <label className="input-label">Logotipo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                {form.logo ? (
                  <img src={form.logo} alt="Logo" style={{ width: 64, height: 64, borderRadius: 'var(--r-md)', objectFit: 'cover', border: '2px solid var(--gray-150)' }} />
                ) : (
                  <div className="img-placeholder" style={{ width: 64, height: 64, borderRadius: 'var(--r-md)', flexShrink: 0 }}>
                    <ImageOff style={{ width: 22, height: 22 }} />
                  </div>
                )}
                <div>
                  <label style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    <span className="btn btn-outline btn-sm" style={{ display: 'inline-flex', pointerEvents: 'none' }}>
                      {uploadingLogo ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.65s linear infinite' }} /> : null}
                      {uploadingLogo ? 'Enviando...' : 'Enviar Logo'}
                    </span>
                  </label>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>JPG, PNG · Max 5MB</div>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Nome do Restaurante *</label>
              <input className="input-field" value={form.name} onChange={f('name')} placeholder="Nome do seu restaurante" />
            </div>
            <div className="input-group">
              <label className="input-label">Descrição</label>
              <textarea className="input-field" value={form.description} onChange={f('description')} rows={3} placeholder="Conte aos clientes sobre seu restaurante..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}>
                <div
                  onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}
                  style={{
                    width: 44, height: 24, borderRadius: 'var(--r-full)',
                    background: form.active ? 'var(--green-500)' : 'var(--gray-300)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: form.active ? 22 : 2,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-800)' }}>
                    {form.active ? '🟢 Restaurante Aberto' : '🔴 Restaurante Fechado'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Clientes podem fazer pedidos</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <MapPin style={{ width: 18, height: 18, color: 'var(--purple-600)' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>Contato & Localização</h2>
            </div>
            <div className="input-group">
              <label className="input-label">Número de Telefone</label>
              <input className="input-field" value={form.phone} onChange={f('phone')} placeholder="(00) 00000-0000" />
            </div>
            <div className="input-group">
              <label className="input-label">Endereço</label>
              <textarea className="input-field" value={form.address} onChange={f('address')} rows={3} placeholder="Endereço completo do restaurante..." />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <DollarSign style={{ width: 18, height: 18, color: 'var(--purple-600)' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>Entrega & Tempo</h2>
            </div>
            <div className="input-group">
              <label className="input-label">Taxa de Entrega (R$)</label>
              <input className="input-field" type="number" step="0.50" min="0" value={form.delivery_fee} onChange={f('delivery_fee')} placeholder="0.00" />
            </div>
            <div className="input-group">
              <label className="input-label">Tempo Médio de Preparo (minutos)</label>
              <input className="input-field" type="number" min="1" value={form.avg_prep_time} onChange={f('avg_prep_time')} placeholder="30" />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 'var(--r-md)', background: 'var(--gray-50)', border: '1px solid var(--gray-150)', fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock style={{ width: 15, height: 15, flexShrink: 0 }} />
              Exibido aos clientes como tempo estimado de espera
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending || !form.name}
          style={{ minWidth: 160 }}
        >
          <Save style={{ width: 17, height: 17 }} />
          {saveMutation.isPending ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}