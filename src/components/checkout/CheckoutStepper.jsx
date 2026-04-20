import React from 'react';
import { Check, User, MapPin, CreditCard, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const CHECKOUT_STEPS = [
  { id: 'contact', label: 'Contato', icon: User },
  { id: 'delivery', label: 'Entrega', icon: MapPin },
  { id: 'payment', label: 'Pagamento', icon: CreditCard },
  { id: 'review', label: 'Revisão', icon: ClipboardCheck },
];

export default function CheckoutStepper({ currentStep }) {
  const currentIdx = CHECKOUT_STEPS.findIndex(s => s.id === currentStep);
  const progressPct = (currentIdx / (CHECKOUT_STEPS.length - 1)) * 100;

  return (
    <div style={{ marginBottom: 22 }}>
      {/* Progress bar */}
      <div style={{ position: 'relative', height: 4, background: 'var(--gray-150)', borderRadius: 'var(--r-full)', marginBottom: 14, marginTop: 4 }}>
        <motion.div
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute', inset: 0, right: 'auto',
            background: 'linear-gradient(90deg, var(--purple-500), var(--purple-600))',
            borderRadius: 'var(--r-full)',
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {CHECKOUT_STEPS.map((step, i) => {
          const isCompleted = i < currentIdx;
          const isActive = i === currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <motion.div
                animate={{
                  scale: isActive ? 1.05 : 1,
                  background: isCompleted || isActive ? 'var(--purple-600)' : '#fff',
                }}
                transition={{ duration: 0.25 }}
                style={{
                  width: 32, height: 32, borderRadius: 'var(--r-full)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${isCompleted || isActive ? 'var(--purple-600)' : 'var(--gray-200)'}`,
                  boxShadow: isActive ? '0 4px 12px rgba(109,40,217,0.3)' : 'none',
                }}
              >
                {isCompleted
                  ? <Check style={{ width: 15, height: 15, color: '#fff' }} />
                  : <Icon style={{ width: 14, height: 14, color: isActive ? '#fff' : 'var(--gray-400)' }} />
                }
              </motion.div>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
                color: isActive ? 'var(--purple-700)' : isCompleted ? 'var(--gray-700)' : 'var(--gray-400)',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}