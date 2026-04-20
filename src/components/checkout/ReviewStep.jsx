import React from 'react';
import { User, Phone, MapPin, Truck, Store, CreditCard, Pencil } from 'lucide-react';

const PAYMENT_LABELS = {
  cash: 'Dinheiro',
  cash_change: 'Dinheiro (com troco)',
  pix: 'PIX',
  debit: 'Cartão de Débito',
  credit: 'Cartão de Crédito',
};

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
      <Icon style={{ width: 15, height: 15, color: 'var(--gray-300)', marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 600, lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-body" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{title}</h3>
          <button
            onClick={onEdit}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--purple-600)', fontSize: 12, fontWeight: 700, padding: 4,
            }}
          >
            <Pencil style={{ width: 12, height: 12 }} /> Editar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ReviewStep({
  customerName, customerPhone, orderType, address,
  paymentMethod, changeAmount, grandTotal,
  notes, setNotes, deliveryFee, items,
  goToStep,
}) {
  const changeAmountNum = parseFloat(changeAmount) || 0;

  return (
    <>
      <ReviewSection title="Contato" onEdit={() => goToStep('contact')}>
        <InfoLine icon={User} label="Nome" value={customerName} />
        <InfoLine icon={Phone} label="Telefone" value={customerPhone} />
      </ReviewSection>

      <ReviewSection title="Entrega" onEdit={() => goToStep('delivery')}>
        <InfoLine
          icon={orderType === 'delivery' ? Truck : Store}
          label="Tipo"
          value={orderType === 'delivery' ? 'Entrega' : 'Retirada no restaurante'}
        />
        {orderType === 'delivery' && address.street && (
          <InfoLine
            icon={MapPin}
            label="Endereço"
            value={
              <>
                {address.street}, {address.number}
                {address.complement && ` — ${address.complement}`}
                <br />
                {address.neighborhood}, {address.city}
                {address.reference && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>📍 {address.reference}</div>}
              </>
            }
          />
        )}
      </ReviewSection>

      <ReviewSection title="Pagamento" onEdit={() => goToStep('payment')}>
        <InfoLine
          icon={CreditCard}
          label="Forma"
          value={
            <>
              {PAYMENT_LABELS[paymentMethod]}
              {paymentMethod === 'cash_change' && changeAmountNum > 0 && (
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500, marginTop: 2 }}>
                  Troco para R$ {changeAmountNum.toFixed(2)} · Você receberá R$ {(changeAmountNum - grandTotal).toFixed(2)}
                </div>
              )}
            </>
          }
        />
      </ReviewSection>

      {/* Notes */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-body">
          <h3 className="section-title">Observações do Pedido</h3>
          <textarea
            className="input-field"
            placeholder="Alguma instrução especial para o preparo? (ex: sem cebola, bem passado...)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ marginBottom: 0, resize: 'none' }}
          />
        </div>
      </div>

      {/* Order summary */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-body">
          <h3 className="section-title">Resumo</h3>
          {items.map((item, i) => (
            <div className="summary-row" key={i}>
              <span style={{ color: 'var(--gray-500)' }}>{item.quantity}× {item.product_name}</span>
              <span style={{ fontWeight: 600 }}>R$ {item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          {orderType === 'delivery' && (
            <div className="summary-row">
              <span style={{ color: 'var(--gray-400)' }}>Taxa de Entrega</span>
              <span>R$ {deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span style={{ color: 'var(--purple-600)' }}>R$ {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </>
  );
}