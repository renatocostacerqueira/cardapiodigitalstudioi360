import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';

function StarRow({ value = 0, size = 14, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= value;
        return (
          <Star
            key={n}
            onClick={onChange ? () => onChange(n) : undefined}
            style={{
              width: size, height: size,
              fill: filled ? '#eab308' : 'transparent',
              color: filled ? '#eab308' : 'var(--gray-300)',
              cursor: onChange ? 'pointer' : 'default',
            }}
          />
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId }, '-created_date'),
  });

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
    : 0;

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.Review.create({
      product_id: productId,
      rating,
      comment: comment.trim() || undefined,
      customer_name: name.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setComment(''); setRating(5); setShowForm(false);
    },
  });

  return (
    <div>
      {/* Rating summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
            {avg ? avg.toFixed(1) : '—'}
          </div>
          <div>
            <StarRow value={Math.round(avg)} size={14} />
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
              {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{
            padding: '8px 16px', borderRadius: 'var(--r-full)',
            border: '1.5px solid var(--purple-300)',
            background: showForm ? 'var(--purple-600)' : '#fff',
            color: showForm ? '#fff' : 'var(--purple-600)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancelar' : 'Avaliar'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--purple-50)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 14, border: '1px solid var(--purple-200)' }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 6 }}>Sua nota</div>
            <StarRow value={rating} size={22} onChange={setRating} />
          </div>
          <input
            className="input-field"
            placeholder="Seu nome (opcional)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <textarea
            className="input-field"
            placeholder="Conte o que achou (opcional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            style={{ marginBottom: 10, resize: 'none' }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            style={{ width: '100%', borderRadius: 'var(--r-full)' }}
          >
            {submitMutation.isPending ? 'Enviando…' : 'Enviar avaliação'}
          </button>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
          <MessageSquare style={{ width: 24, height: 24, margin: '0 auto 8px', color: 'var(--gray-300)' }} />
          <div>Seja o primeiro a avaliar este produto!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.slice(0, 10).map(r => (
            <div key={r.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--gray-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>
                  {r.customer_name || 'Cliente'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                  {moment(r.created_date).fromNow()}
                </div>
              </div>
              <StarRow value={r.rating || 0} size={12} />
              {r.comment && (
                <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 6, lineHeight: 1.5 }}>
                  {r.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}