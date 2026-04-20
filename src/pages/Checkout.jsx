import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';

import CheckoutStepper, { CHECKOUT_STEPS } from '../components/checkout/CheckoutStepper';
import ContactStep from '../components/checkout/ContactStep';
import DeliveryStep from '../components/checkout/DeliveryStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ReviewStep from '../components/checkout/ReviewStep';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  const [step, setStep] = useState('contact');
  const [orderType, setOrderType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [noBell, setNoBell] = useState(false);
  const [noHonk, setNoHonk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState({
    street: '', number: '', complement: '',
    neighborhood: '', city: '', reference: ''
  });

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant-checkout'],
    queryFn: () => base44.entities.Restaurant.list(),
  });
  const restaurant = restaurants[0];
  const deliveryFee = orderType === 'delivery' ? (restaurant?.delivery_fee ?? 5.00) : 0;
  const grandTotal = totalPrice + deliveryFee;

  const changeAmountNum = parseFloat(changeAmount) || 0;
  const changeInvalid = paymentMethod === 'cash_change' && changeAmount !== '' && changeAmountNum < grandTotal;

  // Per-step validation
  const stepValid = {
    contact: !!(customerName && customerPhone),
    delivery: !!(orderType && (orderType !== 'delivery' || (address.street && address.number && address.neighborhood && address.city))),
    payment: !!(paymentMethod && (paymentMethod !== 'cash_change' || (changeAmount && !changeInvalid))),
    review: true,
  };

  const canSubmit = stepValid.contact && stepValid.delivery && stepValid.payment;

  const currentIdx = CHECKOUT_STEPS.findIndex(s => s.id === step);
  const isFirstStep = currentIdx === 0;
  const isLastStep = currentIdx === CHECKOUT_STEPS.length - 1;

  const goNext = () => {
    if (!stepValid[step]) return;
    const next = CHECKOUT_STEPS[currentIdx + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    if (isFirstStep) { navigate('/cart'); return; }
    const prev = CHECKOUT_STEPS[currentIdx - 1];
    if (prev) setStep(prev.id);
  };

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
      no_bell: noBell,
      no_honk: noHonk,
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
      <div className="page-container" style={{ paddingBottom: 140 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <button className="back-btn" onClick={goBack} aria-label="Voltar">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Finalizar Pedido</h1>
            <p className="page-subtitle">Etapa {currentIdx + 1} de {CHECKOUT_STEPS.length}</p>
          </div>
        </motion.div>

        <CheckoutStepper currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'contact' && (
              <ContactStep
                customerName={customerName} setCustomerName={setCustomerName}
                customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
              />
            )}

            {step === 'delivery' && (
              <DeliveryStep
                orderType={orderType} setOrderType={setOrderType}
                address={address} setAddress={setAddress}
                deliveryNotes={deliveryNotes} setDeliveryNotes={setDeliveryNotes}
                deliveryFee={restaurant?.delivery_fee ?? 5.00}
                noBell={noBell} setNoBell={setNoBell}
                noHonk={noHonk} setNoHonk={setNoHonk}
              />
            )}

            {step === 'payment' && (
              <PaymentStep
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                changeAmount={changeAmount} setChangeAmount={setChangeAmount}
                grandTotal={grandTotal}
              />
            )}

            {step === 'review' && (
              <ReviewStep
                customerName={customerName} customerPhone={customerPhone}
                orderType={orderType} address={address}
                paymentMethod={paymentMethod} changeAmount={changeAmount}
                grandTotal={grandTotal} deliveryFee={deliveryFee}
                notes={notes} setNotes={setNotes}
                items={items}
                goToStep={setStep}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Sticky step running total — visible on all steps except review */}
        {step !== 'review' && (
          <div style={{
            background: '#fff', border: '1px solid var(--gray-150)',
            borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              {items.length} {items.length === 1 ? 'item' : 'itens'}
              {orderType === 'delivery' && ` · Taxa R$ ${deliveryFee.toFixed(2)}`}
            </span>
            <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--purple-600)', letterSpacing: '-0.02em' }}>
              R$ {grandTotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline btn-lg"
            onClick={goBack}
            style={{ flex: '0 0 auto', borderRadius: 'var(--r-full)', width: 54, padding: 0 }}
            aria-label="Voltar"
          >
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>

          {!isLastStep ? (
            <motion.button
              whileHover={{ scale: stepValid[step] ? 1.01 : 1 }}
              whileTap={{ scale: stepValid[step] ? 0.98 : 1 }}
              className="btn btn-primary btn-lg"
              onClick={goNext}
              disabled={!stepValid[step]}
              style={{ flex: 1, borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: 16 }}
            >
              Continuar
              <ChevronRight style={{ width: 18, height: 18 }} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: canSubmit ? 1.01 : 1 }}
              whileTap={{ scale: canSubmit ? 0.98 : 1 }}
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{ flex: 1, borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: 16 }}
            >
              {submitting ? 'Enviando Pedido…' : 'Finalizar Pedido'}
              {!submitting && <ChevronRight style={{ width: 18, height: 18 }} />}
            </motion.button>
          )}
        </div>

        {!stepValid[step] && !isLastStep && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 10 }}>
            Preencha todos os campos obrigatórios para continuar
          </p>
        )}
      </div>
    </div>
  );
}