import React from 'react';

const STATUS_MAP = {
  new: { label: 'Novo Pedido', className: 'status-new' },
  awaiting_confirmation: { label: 'Aguardando Confirmação', className: 'status-awaiting' },
  in_preparation: { label: 'Em Preparo', className: 'status-preparing' },
  ready: { label: 'Pronto', className: 'status-ready' },
  out_for_delivery: { label: 'Saiu para Entrega', className: 'status-delivering' },
  delivered: { label: 'Entregue', className: 'status-delivered' },
  picked_up: { label: 'Retirado', className: 'status-delivered' },
  cancelled: { label: 'Cancelado', className: 'status-cancelled' },
};

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, className: '' };
  return (
    <span className={`status-badge ${info.className}`}>
      {info.label}
    </span>
  );
}