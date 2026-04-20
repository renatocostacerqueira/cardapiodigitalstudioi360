import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import DashboardMetrics from '../../components/admin/DashboardMetrics';

export default function Metrics() {
  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders-panel'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 30000,
  });

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', marginBottom: 4 }}>Métricas</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          {moment().format('dddd, DD [de] MMMM [de] YYYY')} · análise de desempenho
        </p>
      </div>

      <DashboardMetrics orders={orders} />
    </div>
  );
}