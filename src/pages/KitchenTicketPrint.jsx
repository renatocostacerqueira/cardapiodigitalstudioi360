import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Printer, ArrowLeft } from 'lucide-react';
import moment from 'moment';

export default function KitchenTicketPrint() {
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
      {/* Screen controls - hidden when printing */}
      <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <Printer style={{ width: 16, height: 16 }} /> Imprimir Ticket Cozinha
        </button>
      </div>

      {/* Ticket content */}
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
            *** TICKET COZINHA ***
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.02em', color: '#000' }}>
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

        {/* Items */}
        <div style={{ marginBottom: 16 }}>
          {ticket.items?.map((item, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < ticket.items.length - 1 ? '1px dashed #ddd' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#000', minWidth: 36, letterSpacing: '-0.02em' }}>
                  {item.quantity}x
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#000', lineHeight: 1.3 }}>
                  {item.product_name}
                </span>
              </div>
              {item.notes && (
                <div style={{ marginTop: 5, marginLeft: 46, fontSize: 13, color: '#c2410c', fontStyle: 'italic', fontWeight: 600 }}>
                  ⚠ {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order notes */}
        {ticket.notes && (
          <div style={{ borderTop: '2px dashed #ccc', paddingTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>
              Observações do Pedido
            </div>
            <div style={{ fontSize: 14, color: '#000', fontWeight: 600, lineHeight: 1.5 }}>
              {ticket.notes}
            </div>
          </div>
        )}

        <div style={{ borderTop: '2px dashed #ccc', paddingTop: 12, textAlign: 'center', fontSize: 11, color: '#999' }}>
          Via Cozinha — Não Entregar
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