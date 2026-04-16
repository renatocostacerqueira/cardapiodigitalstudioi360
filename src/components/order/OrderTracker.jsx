import React from 'react';
import { CheckCircle2, Circle, Clock, ChefHat, PackageCheck, Truck, Home, Store } from 'lucide-react';

const DELIVERY_STEPS = [
  { key: 'new', label: 'Order Received', icon: Clock, emoji: '📋' },
  { key: 'awaiting_confirmation', label: 'Confirming', icon: Clock, emoji: '⏳' },
  { key: 'in_preparation', label: 'In Kitchen', icon: ChefHat, emoji: '🍳' },
  { key: 'ready', label: 'Ready', icon: PackageCheck, emoji: '📦' },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck, emoji: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: Home, emoji: '✅' },
];

const PICKUP_STEPS = [
  { key: 'new', label: 'Order Received', icon: Clock, emoji: '📋' },
  { key: 'awaiting_confirmation', label: 'Confirming', icon: Clock, emoji: '⏳' },
  { key: 'in_preparation', label: 'In Kitchen', icon: ChefHat, emoji: '🍳' },
  { key: 'ready', label: 'Ready for Pickup', icon: PackageCheck, emoji: '🏪' },
  { key: 'picked_up', label: 'Picked Up', icon: Store, emoji: '✅' },
];

const STATUS_INDEX = {
  new: 0,
  awaiting_confirmation: 1,
  in_preparation: 2,
  ready: 3,
  out_for_delivery: 4,
  delivered: 5,
  picked_up: 4,
  cancelled: -1,
};

const PICKUP_STATUS_INDEX = {
  new: 0,
  awaiting_confirmation: 1,
  in_preparation: 2,
  ready: 3,
  picked_up: 4,
  cancelled: -1,
};

export default function OrderTracker({ status, orderType }) {
  const steps = orderType === 'pickup' ? PICKUP_STEPS : DELIVERY_STEPS;
  const indexMap = orderType === 'pickup' ? PICKUP_STATUS_INDEX : STATUS_INDEX;
  const currentIdx = indexMap[status] ?? 0;
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div style={{
        padding: '16px 20px', borderRadius: 'var(--r-md)',
        background: 'var(--red-50)', border: '1.5px solid #fecaca',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>❌</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--red-500)' }}>Order Cancelled</div>
        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>This order has been cancelled</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '6px 0' }}>
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;

        return (
          <div key={step.key} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative' }}>
            {/* Line connector */}
            {idx < steps.length - 1 && (
              <div style={{
                position: 'absolute',
                left: 15, top: 32,
                width: 2, height: 28,
                background: isDone ? 'var(--purple-400)' : 'var(--gray-150)',
                transition: 'background 0.3s',
                zIndex: 0,
              }} />
            )}

            {/* Step dot */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDone ? 'var(--purple-600)' : isCurrent ? 'var(--purple-50)' : '#fff',
              border: `2px solid ${isDone ? 'var(--purple-600)' : isCurrent ? 'var(--purple-400)' : 'var(--gray-200)'}`,
              zIndex: 1, position: 'relative',
              transition: 'all 0.3s',
              boxShadow: isCurrent ? '0 0 0 4px rgba(109,40,217,0.12)' : 'none',
            }}>
              {isDone
                ? <CheckCircle2 style={{ width: 16, height: 16, color: '#fff' }} />
                : <span style={{ fontSize: 13 }}>{step.emoji}</span>
              }
            </div>

            {/* Label */}
            <div style={{ paddingBottom: 22, paddingTop: 4 }}>
              <div style={{
                fontSize: 13, fontWeight: isCurrent ? 800 : isDone ? 600 : 500,
                color: isCurrent ? 'var(--purple-700)' : isDone ? 'var(--gray-700)' : 'var(--gray-300)',
                transition: 'color 0.3s',
              }}>
                {step.label}
              </div>
              {isCurrent && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 3,
                  fontSize: 10, fontWeight: 700, color: 'var(--purple-500)',
                  background: 'var(--purple-50)', padding: '2px 8px', borderRadius: 'var(--r-full)',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--purple-500)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  Current
                </div>
              )}
            </div>
          </div>
        );
      })}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}