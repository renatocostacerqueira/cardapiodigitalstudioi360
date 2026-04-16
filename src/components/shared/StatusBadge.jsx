import React from 'react';

const STATUS_MAP = {
  new: { label: 'New Order', className: 'status-new' },
  awaiting_confirmation: { label: 'Awaiting Confirmation', className: 'status-awaiting' },
  in_preparation: { label: 'In Preparation', className: 'status-preparing' },
  ready: { label: 'Ready', className: 'status-ready' },
  out_for_delivery: { label: 'Out for Delivery', className: 'status-delivering' },
  delivered: { label: 'Delivered', className: 'status-delivered' },
  picked_up: { label: 'Picked Up', className: 'status-delivered' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
};

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, className: '' };
  return (
    <span className={`status-badge ${info.className}`}>
      {info.label}
    </span>
  );
}