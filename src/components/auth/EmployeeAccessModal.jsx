import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Lock, User } from 'lucide-react';

export default function EmployeeAccessModal({ onSuccess }) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCpf = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const rawCpf = cpf.replace(/\D/g, '');
      const res = await base44.functions.invoke('employeeLogin', { cpf: rawCpf, password });
      if (res.data?.success) {
        localStorage.setItem('employee_session', JSON.stringify(res.data.employee));
        onSuccess(res.data.employee);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'CPF ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 'var(--r-xl)',
        width: '100%', maxWidth: 380,
        boxShadow: 'var(--shadow-xl)',
        padding: '32px 28px',
        animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
      }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--r-full)',
            background: 'var(--purple-50)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock style={{ width: 24, height: 24, color: 'var(--purple-600)' }} />
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', textAlign: 'center', marginBottom: 4 }}>
          Acesso Restrito
        </h2>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', marginBottom: 24 }}>
          Informe seu CPF e senha de acesso
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">CPF</label>
            <input
              className="input-field"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={e => setCpf(formatCpf(e.target.value))}
              inputMode="numeric"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Senha</label>
            <input
              className="input-field"
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--r-md)',
              background: 'var(--red-50)', border: '1px solid #fecaca',
              fontSize: 13, color: 'var(--red-600)', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ borderRadius: 'var(--r-full)', marginTop: 4 }}
          >
            {loading
              ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
              : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}