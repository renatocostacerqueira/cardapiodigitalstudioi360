import React from 'react';
import { MessageCircle } from 'lucide-react';

// Abre o WhatsApp com o link de rastreamento do pedido já preenchido.
// - Se `phone` é informado, abre direto a conversa com o cliente (uso no Admin).
// - Se não, abre o seletor do WhatsApp para o próprio usuário escolher o contato.
export default function SendWhatsAppButton({
  orderId,
  orderNumber,
  customerName,
  phone,
  label = 'Enviar por WhatsApp',
  variant = 'full', // 'full' (btn grande) | 'compact' (pequeno)
  style,
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    const trackingUrl = `${window.location.origin}/tracking/${orderId}`;
    const greeting = customerName ? `Olá, ${customerName}! ` : '';
    const orderTxt = orderNumber ? ` *${orderNumber}*` : '';
    const message =
      `${greeting}🍔 Acompanhe seu pedido${orderTxt} em tempo real:\n\n${trackingUrl}`;
    const encoded = encodeURIComponent(message);

    // Sanitiza o telefone: mantém apenas dígitos
    const digits = (phone || '').replace(/\D/g, '');
    const url = digits
      ? `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 'var(--r-full)',
          background: '#25D366', color: '#fff', border: 'none',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
          ...style,
        }}
      >
        <MessageCircle style={{ width: 13, height: 13 }} />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="btn btn-lg"
      style={{
        borderRadius: 'var(--r-full)',
        background: '#25D366', color: '#fff',
        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
        gap: 10,
        ...style,
      }}
    >
      <MessageCircle style={{ width: 18, height: 18 }} />
      {label}
    </button>
  );
}