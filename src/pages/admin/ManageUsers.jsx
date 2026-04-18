import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, Trash2, Edit2, ChefHat, Truck, X, Loader2, ShieldCheck } from 'lucide-react';

const ROLE_LABELS = {
  admin: { label: 'Admin', color: '#1d4ed8', bg: '#eff6ff', icon: ShieldCheck },
  cozinha: { label: 'Cozinha', color: 'var(--orange-500)', bg: 'var(--orange-50)', icon: ChefHat },
  entregador: { label: 'Entregador', color: 'var(--purple-600)', bg: 'var(--purple-50)', icon: Truck },
};

function RoleBadge({ role }) {
  const info = ROLE_LABELS[role];
  if (!info) return null;
  const Icon = info.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 'var(--r-full)',
      background: info.bg, color: info.color,
      fontSize: 12, fontWeight: 700,
    }}>
      <Icon style={{ width: 12, height: 12 }} />
      {info.label}
    </span>
  );
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.full_name || '',
    cpf: user?.cpf ? formatCpf(user.cpf) : '',
    password: user?.custom_password || '',
    role: user?.role || 'cozinha',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const rawCpf = form.cpf.replace(/\D/g, '');
    try {
      if (isEdit) {
        await base44.functions.invoke('manageUsers', {
          action: 'update',
          userId: user.id,
          role: form.role,
          cpf: rawCpf,
          password: form.password,
          name: form.name,
        });
      } else {
        if (!form.name || !rawCpf || !form.password || !form.role) {
          throw new Error('Preencha todos os campos obrigatórios.');
        }
        await base44.functions.invoke('manageUsers', {
          action: 'create',
          name: form.name,
          cpf: rawCpf,
          password: form.password,
          role: form.role,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-xl)', padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>
            {isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>
          <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--r-sm)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Nome</label>
            <input className="input-field" placeholder="Nome do funcionário" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          <div className="input-group">
            <label className="input-label">CPF</label>
            <input
              className="input-field"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={e => setForm(f => ({ ...f, cpf: formatCpf(e.target.value) }))}
              inputMode="numeric"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Senha de Acesso</label>
            <input className="input-field" type="password" placeholder="Senha para login" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>

          <div className="input-group">
            <label className="input-label">Tipo de Perfil</label>
            <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="cozinha">Cozinha</option>
              <option value="entregador">Entregador</option>
            </select>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--red-50)', border: '1px solid #fecaca', fontSize: 13, color: 'var(--red-600)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState(undefined);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const errorTimerRef = useRef(null);

  const showError = (msg) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(''), 4000);
  };

  React.useEffect(() => () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('manageUsers', { action: 'list' });
      setUsers(res.data?.users || []);
    } catch {
      showError('Erro ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja remover este funcionário?')) return;
    setDeletingId(userId);
    try {
      await base44.functions.invoke('manageUsers', { action: 'delete', userId });
      await loadUsers();
    } catch {
      showError('Erro ao remover funcionário.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', marginBottom: 4 }}>Funcionários</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{users.length} funcionário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => setModalUser(null)}>
          <UserPlus style={{ width: 16, height: 16 }} />
          Novo Funcionário
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--red-50)', border: '1px solid #fecaca', fontSize: 13, color: 'var(--red-600)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <UserPlus />
          <h3>Nenhum funcionário cadastrado</h3>
          <p>Clique em "Novo Funcionário" para adicionar membros da equipe</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => (
            <div key={u.id} className="card">
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-full)',
                  background: ROLE_LABELS[u.role]?.bg || 'var(--gray-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: ROLE_LABELS[u.role]?.color || 'var(--gray-500)' }}>
                    {(u.full_name || '?')[0].toUpperCase()}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 3 }}>
                    {u.full_name || '(sem nome)'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 6 }}>
                    CPF: {u.cpf ? formatCpf(u.cpf) : '—'}
                  </div>
                  <RoleBadge role={u.role} />
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => setModalUser(u)}
                    style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--purple-50)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Edit2 style={{ width: 14, height: 14, color: 'var(--purple-600)' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deletingId === u.id}
                    style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--red-50)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {deletingId === u.id
                      ? <Loader2 style={{ width: 14, height: 14, color: 'var(--red-400)', animation: 'spin 1s linear infinite' }} />
                      : <Trash2 style={{ width: 14, height: 14, color: 'var(--red-400)' }} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalUser !== undefined && (
        <UserFormModal
          user={modalUser}
          onClose={() => setModalUser(undefined)}
          onSaved={loadUsers}
        />
      )}
    </div>
  );
}