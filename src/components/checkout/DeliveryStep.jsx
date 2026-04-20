import React from 'react';
import { MapPin, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypeOption from './TypeOption';

const DELIVERY_SUGGESTIONS = [
  'Deixar na portaria',
  'Bater no portão',
  'Deixar com o vizinho',
  'Ligar ao chegar',
];

export default function DeliveryStep({
  orderType, setOrderType,
  address, setAddress,
  deliveryNotes, setDeliveryNotes,
  deliveryFee,
  noBell, setNoBell,
  noHonk, setNoHonk,
}) {
  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-body">
          <h3 className="section-title">Como deseja receber?</h3>
          <TypeOption
            value="delivery" current={orderType} onChange={setOrderType}
            icon={Truck}
            label="Entrega"
            sublabel={`Taxa de entrega: R$ ${deliveryFee.toFixed(2)}`}
          />
          <TypeOption
            value="pickup" current={orderType} onChange={setOrderType}
            icon={Store} label="Retirada no Restaurante" sublabel="Sem taxa — retire no balcão"
          />
        </div>
      </div>

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

                {/* Toggles: Não tocar campainha / Não buzinar */}
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'no_bell', label: '🔕 Não tocar campainha', value: !!noBell, toggle: () => setNoBell(!noBell) },
                    { key: 'no_honk', label: '🚫 Não buzinar', value: !!noHonk, toggle: () => setNoHonk(!noHonk) },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={opt.toggle}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--r-md)',
                        border: `1.5px solid ${opt.value ? 'var(--purple-500)' : 'var(--gray-200)'}`,
                        background: opt.value ? 'var(--purple-50)' : '#fff',
                        color: opt.value ? 'var(--purple-700)' : 'var(--gray-600)',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}