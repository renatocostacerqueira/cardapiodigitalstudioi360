import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Printer, ArrowLeft } from 'lucide-react';
import moment from 'moment';

const PAYMENT_LABELS = {
  cash: 'Dinheiro',
  cash_change: 'Dinheiro (com troco)',
  pix: 'PIX',
  debit: 'Cartão de Débito',
  credit: 'Cartão de Crédito',
};

export default function DeliveryTicketPrint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const tickets = await base44.entities.Ticket.filter({ id });
      return tickets[0];
    },
  });

  if (isLoading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!ticket) return <div className="empty-state"><h3>Ticket not found</h3></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <Printer style={{ width: 16, height: 16 }} /> Imprimir Ticket Entrega
        </button>
      </div>

      <div className="print-ticket" style={{
        maxWidth: 320,
        margin: '0 auto',
        padding: '24px 20px',
        background: '#fff',
        fontFamily: "'Courier New', Courier, monospace",
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>
            *** TICKET ENTREGA ***
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#000' }}>
            {ticket.order_number}
          </div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
            {moment(ticket.created_date).format('DD/MM/YYYY HH:mm')}
          </div>
          <div style={{
            display: 'inline-block', marginTop: 8,
            background: ticket.order_type === 'delivery' ? '#ede9fe' : '#dcfce7',
            color: ticket.order_type === 'delivery' ? '#6d28d9' : '#16a34a',
            padding: '3px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 800, letterSpacing: '0.05em',
          }}>
            {ticket.order_type === 'delivery' ? '🛵 ENTREGA' : '🏪 RETIRADA'}
          </div>
        </div>

        {/* Customer */}
        <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px dashed #ddd' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Cliente</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#000', marginBottom: 3 }}>{ticket.customer_name}</div>
          <div style={{ fontSize: 14, color: '#333' }}>📞 {ticket.customer_phone}</div>
        </div>

        {/* Address */}
        {ticket.order_type === 'delivery' && ticket.address_street && (
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px dashed #ddd' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Endereço de Entrega</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#000', lineHeight: 1.6 }}>
              {ticket.address_street}, {ticket.address_number}
              {ticket.address_complement && ` — ${ticket.address_complement}`}
              <br />{ticket.address_neighborhood}
              <br />{ticket.address_city}
            </div>
            {ticket.address_reference && (
              <div style={{ fontSize: 13, color: '#666', marginTop: 5 }}>
                📍 Ref: {ticket.address_reference}
              </div>
            )}
          </div>
        )}

        {/* Items summary */}
        <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px dashed #ddd' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Itens</div>
          {ticket.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{item.quantity}× {item.product_name}</span>
              <span style={{ color: '#444' }}>R$ {item.subtotal?.toFixed(2)}</span>
            </div>
          ))}
          {ticket.delivery_fee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginTop: 4 }}>
              <span>Taxa de entrega</span>
              <span>R$ {ticket.delivery_fee?.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, color: '#000', marginTop: 8, paddingTop: 8, borderTop: '1px solid #ccc' }}>
            <span>TOTAL</span>
            <span>R$ {ticket.total_price?.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}
        <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: ticket.notes ? '1px dashed #ddd' : 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Pagamento</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#000' }}>
            {PAYMENT_LABELS[ticket.payment_method] || ticket.payment_method}
          </div>
          {ticket.payment_method === 'cash_change' && ticket.change_amount > 0 && (
            <div style={{ fontSize: 14, color: '#c2410c', fontWeight: 800, marginTop: 5 }}>
              ⚠ TROCO PARA: R$ {ticket.change_amount?.toFixed(2)}
            </div>
          )}
        </div>

        {ticket.notes && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Observações</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', lineHeight: 1.5, fontStyle: 'italic' }}>{ticket.notes}</div>
          </div>
        )}

        <div style={{ borderTop: '2px dashed #ccc', paddingTop: 12, textAlign: 'center', fontSize: 11, color: '#999' }}>
          Via Entrega / Logística
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-ticket {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}