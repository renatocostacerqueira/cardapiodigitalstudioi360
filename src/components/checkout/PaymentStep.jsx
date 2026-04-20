import React from 'react';
import { Banknote, CreditCard, QrCode, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypeOption from './TypeOption';

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'cash_change', label: 'Dinheiro (preciso de troco)', icon: Banknote },
  { value: 'pix', label: 'PIX', icon: QrCode },
  { value: 'debit', label: 'Cartão de Débito', icon: CreditCard },
  { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
];

export default function PaymentStep({
  paymentMethod, setPaymentMethod,
  changeAmount, setChangeAmount,
  grandTotal,
}) {
  const changeAmountNum = parseFloat(changeAmount) || 0;
  const changeInvalid = paymentMethod === 'cash_change' && changeAmount !== '' && changeAmountNum < grandTotal;
  const changeOk = paymentMethod === 'cash_change' && changeAmountNum >= grandTotal;

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="card-body">
        <h3 className="section-title">Forma de Pagamento</h3>
        {PAYMENT_OPTIONS.map(opt => (
          <TypeOption
            key={opt.value}
            value={opt.value}
            current={paymentMethod}
            onChange={setPaymentMethod}
            icon={opt.icon}
            label={opt.label}
          />
        ))}
        <AnimatePresence>
          {paymentMethod === 'cash_change' && (
            <motion.div
              key="change"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="input-group" style={{ marginTop: 6, marginBottom: 0 }}>
                <label className="input-label" htmlFor="change">Troco para quanto? *</label>
                <input
                  id="change"
                  className="input-field"
                  type="number"
                  placeholder={`Ex: ${(grandTotal + 10).toFixed(2)}`}
                  value={changeAmount}
                  onChange={e => setChangeAmount(e.target.value)}
                  style={{ borderColor: changeInvalid ? 'var(--red-400)' : undefined }}
                />
                {changeInvalid && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--red-500)', fontWeight: 600 }}
                  >
                    <AlertCircle style={{ width: 13, height: 13 }} />
                    Informe um valor igual ou acima do total do seu pedido (R$ {grandTotal.toFixed(2)})
                  </motion.div>
                )}
                {changeOk && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 8, padding: '10px 14px', background: 'var(--green-50)', borderRadius: 'var(--r-md)', border: '1px solid #bbf7d0' }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--green-600)', fontWeight: 600, marginBottom: 2 }}>Você receberá de troco:</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green-600)', letterSpacing: '-0.02em' }}>
                      R$ {(changeAmountNum - grandTotal).toFixed(2)}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}