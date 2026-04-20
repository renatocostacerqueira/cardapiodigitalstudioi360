import React from 'react';

export default function ContactStep({ customerName, setCustomerName, customerPhone, setCustomerPhone }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="card-body">
        <h3 className="section-title">Seus Dados</h3>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: -8, marginBottom: 16 }}>
          Para entrar em contato sobre seu pedido
        </p>
        <div className="input-group">
          <label className="input-label" htmlFor="cname">Nome Completo *</label>
          <input id="cname" className="input-field" placeholder="João Silva"
            value={customerName} onChange={e => setCustomerName(e.target.value)} autoFocus />
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label" htmlFor="cphone">Telefone / WhatsApp *</label>
          <input id="cphone" className="input-field" placeholder="(00) 00000-0000"
            type="tel"
            value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>
            Você receberá um link para acompanhar o pedido por WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}