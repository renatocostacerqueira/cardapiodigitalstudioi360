import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, Store, Banknote, CreditCard, QrCode, ChevronRight, AlertCircle, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';

const DELIVERY_SUGGESTIONS = [
  'Deixar na portaria',
  'Bater no portão',
  'Deixar com o vizinho',
  'Ligar ao chegar',
  'Entregar sem campainha',
];

function SectionCard({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card"
      style={{ marginBottom: 14 }}
    >
      <div className="card-body">
        <h3 className="section-title">{title}</h3>
        {children}
      </div>
    </motion.div>
  );
}

function TypeOption({ value, current, onChange, icon: Icon, label, sublabel }) {
  const selected = current === value;
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onChange(value)}
      role="radio"
      aria-checked={selected}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        borderRadius: 'var(--r-md)', cursor: 'pointer',
        border: `1.5px solid ${selected ? 'var(--purple-400)' : 'var(--gray-150)'}`,
        background: selected ? 'var(--purple-50)' : '#fff',
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: 10,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 'var(--r-sm)', flexShrink: 0,
        background: selected ? 'var(--purple-100)' : 'var(--gray-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}>
        <Icon style={{ width: 20, height: 20, color: selected ? 'var(--purple-600)' : 'var(--gray-400)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>{sublabel}</div>}
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: 'var(--r-full)',
        border: `2px solid ${selected ? 'var(--purple-600)' : 'var(--gray-300)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: 'var(--r-full)', background: 'var(--purple-600)' }} />}
      </div>
    </motion.div>
  );
}

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'cash_change', label: 'Dinheiro (preciso de troco)', icon: Banknote },
  { value: 'pix', label: 'PIX', icon: QrCode },
  { value: 'debit', label: 'Cartão de Débito', icon: CreditCard },
  { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [orderType, setOrderType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState({
    street: '', number: '', complement: '',
    neighborhood: '', city: '', reference: ''
  });

  // Fetch delivery fee from restaurant settings
  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant-checkout'],
    queryFn: () => base44.entities.Restaurant.list(),
  });
  const restaurant = restaurants[0];
  const deliveryFee = orderType === 'delivery' ? (restaurant?.delivery_fee ?? 5.00) : 0;
  const grandTotal = totalPrice + deliveryFee;

  const changeAmountNum = parseFloat(changeAmount) || 0;
  const changeInvalid = paymentMethod === 'cash_change' && changeAmount !== '' && changeAmountNum < grandTotal;
  const changeOk = paymentMethod === 'cash_change' && changeAmountNum >= grandTotal;

  const canSubmit = customerName && customerPhone && orderType && paymentMethod
    && (orderType !== 'delivery' || (address.street && address.number && address.neighborhood && address.city))
    && (paymentMethod !== 'cash_change' || (changeAmount && !changeInvalid));

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();

    const orderData = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      order_type: orderType,
      payment_method: paymentMethod,
      change_amount: paymentMethod === 'cash_change' ? changeAmountNum : 0,
      total_price: grandTotal,
      delivery_fee: deliveryFee,
      status: 'new',
      notes: [notes, deliveryNotes].filter(Boolean).join(' | '),
      items,
      kitchen_printed: false,
      delivery_printed: false,
    };

    if (orderType === 'delivery') {
      orderData.address_street = address.street;
      orderData.address_number = address.number;
      orderData.address_complement = address.complement;
      orderData.address_neighborhood = address.neighborhood;
      orderData.address_city = address.city;
      orderData.address_reference = address.reference;
    }

    const created = await base44.entities.Order.create(orderData);

    const ticketItems = items.map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.subtotal,
      notes: i.notes || '',
    }));

    const kitchenTicket = {
      order_id: created.id,
      order_number: orderNumber,
      ticket_type: 'kitchen',
      order_type: orderType,
      customer_name: customerName,
      notes: orderData.notes,
      items: ticketItems,
      total_price: grandTotal,
      delivery_fee: deliveryFee,
      printed: false,
    };

    const deliveryTicket = {
      order_id: created.id,
      order_number: orderNumber,
      ticket_type: 'delivery',
      order_type: orderType,
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_method: paymentMethod,
      change_amount: paymentMethod === 'cash_change' ? changeAmountNum : 0,
      notes: orderData.notes,
      items: ticketItems,
      total_price: grandTotal,
      delivery_fee: deliveryFee,
      printed: false,
    };

    if (orderType === 'delivery') {
      deliveryTicket.address_street = address.street;
      deliveryTicket.address_number = address.number;
      deliveryTicket.address_complement = address.complement;
      deliveryTicket.address_neighborhood = address.neighborhood;
      deliveryTicket.address_city = address.city;
      deliveryTicket.address_reference = address.reference;
    }

    await Promise.all([
      base44.entities.Ticket.create(kitchenTicket),
      base44.entities.Ticket.create(deliveryTicket),
    ]);

    clearCart();
    navigate(`/confirmation/${created.id}`);
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingBottom: 40 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <button className="back-btn" onClick={() => navigate('/cart')} aria-label="Voltar">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Finalizar Pedido</h1>
            <p className="page-subtitle">Revise e confirme</p>
          </div>
        </motion.div>

        {/* Customer Info */}
        <SectionCard title="Seus Dados" delay={0.05}>
          <div className="input-group">
            <label className="input-label" htmlFor="cname">Nome Completo</label>
            <input id="cname" className="input-field" placeholder="João Silva"
              value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="cphone">Telefone / WhatsApp</label>
            <input id="cphone" className="input-field" placeholder="(00) 00000-0000"
              value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>
        </SectionCard>

        {/* Order Type */}
        <SectionCard title="Como deseja receber?" delay={0.1}>
          <TypeOption value="delivery" current={orderType} onChange={setOrderType}
            icon={Truck}
            label="Entrega"
            sublabel={`Taxa de entrega: R$ ${(restaurant?.delivery_fee ?? 5).toFixed(2)}`}
          />
          <TypeOption value="pickup" current={orderType} onChange={setOrderType}
            icon={Store} label="Retirada no Restaurante" sublabel="Sem taxa — retire no balcão" />
        </SectionCard>

        {/* Address */}
        <AnimatePresence>
          {orderType === 'delivery' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', marginBottom: 14 }}
            >
              <div className="card">
                <div className="card-body">
                  <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin style={{ width: 17, height: 17, color: 'var(--purple-500)' }} />
                    Endereço de Entrega
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Rua *</label>
                      <input className="input-field" placeholder="Nome da rua"
                        value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Número *</label>
                      <input className="input-field" placeholder="123"
                        value={address.number} onChange={e => setAddress({ ...address, number: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Complemento</label>
                    <input className="input-field" placeholder="Apto, bloco, andar..."
                      value={address.complement} onChange={e => setAddress({ ...address, complement: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Bairro *</label>
                      <input className="input-field" placeholder="Bairro"
                        value={address.neighborhood} onChange={e => setAddress({ ...address, neighborhood: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Cidade *</label>
                      <input className="input-field" placeholder="Cidade"
                        value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Ponto de Referência</label>
                    <input className="input-field" placeholder="Próximo ao parque, ao lado da farmácia..."
                      value={address.reference} onChange={e => setAddress({ ...address, reference: e.target.value })} />
                  </div>

                  {/* Delivery observations */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Observações de Entrega (opcional)</label>
                    <textarea
                      className="input-field"
                      placeholder="Instruções para o entregador..."
                      value={deliveryNotes}
                      onChange={e => setDeliveryNotes(e.target.value)}
                      rows={2}
                      style={{ marginBottom: 8, resize: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {DELIVERY_SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDeliveryNotes(prev => prev ? `${prev}, ${s}` : s)}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: '5px 12px',
                            borderRadius: 'var(--r-full)',
                            border: '1.5px solid var(--purple-200)',
                            background: deliveryNotes.includes(s) ? 'var(--purple-100)' : 'var(--purple-50)',
                            color: 'var(--purple-700)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment */}
        <SectionCard title="Forma de Pagamento" delay={0.15}>
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
                      <div style={{ fontSize: 12, color: 'var(--green-600)', fontWeight: 600, marginBottom: 2 }}>Troco a devolver</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green-600)', letterSpacing: '-0.02em' }}>
                        R$ {(changeAmountNum - grandTotal).toFixed(2)}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        {/* Notes */}
        <SectionCard title="Observações do Pedido" delay={0.2}>
          <textarea
            className="input-field"
            placeholder="Alguma instrução especial para o preparo? (ex: sem cebola, bem passado...)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ marginBottom: 0, resize: 'none' }}
          />
        </SectionCard>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="card" style={{ marginBottom: 24 }}>
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
        </motion.div>

        <motion.button
          whileHover={{ scale: canSubmit ? 1.01 : 1 }}
          whileTap={{ scale: canSubmit ? 0.98 : 1 }}
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{ borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: 16 }}
        >
          {submitting ? 'Enviando Pedido…' : 'Fazer Pedido'}
          {!submitting && <ChevronRight style={{ width: 18, height: 18 }} />}
        </motion.button>

        {!canSubmit && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 10 }}>
            Preencha todos os campos obrigatórios para continuar
          </p>
        )}
      </div>
    </div>
  );
}