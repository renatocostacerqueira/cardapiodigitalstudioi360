import React, { useMemo, useState } from 'react';
import moment from 'moment';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart,
} from 'recharts';
import {
  DollarSign, ShoppingBag, TrendingUp, XCircle, Trophy, AlertCircle, ChefHat, Truck, CheckCircle2,
} from 'lucide-react';

const PERIODS = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: '7 dias' },
  { id: 'month', label: '30 dias' },
];

const CURRENCY = (v) => `R$ ${(v || 0).toFixed(2)}`;

function KpiCard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="card">
      <div className="card-body" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 16, height: 16, color }} />
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function DashboardMetrics({ orders }) {
  const [period, setPeriod] = useState('today');

  const { startDate, bucketBy } = useMemo(() => {
    if (period === 'today') return { startDate: moment().startOf('day'), bucketBy: 'hour' };
    if (period === 'week') return { startDate: moment().subtract(6, 'days').startOf('day'), bucketBy: 'day' };
    return { startDate: moment().subtract(29, 'days').startOf('day'), bucketBy: 'day' };
  }, [period]);

  const filtered = useMemo(
    () => orders.filter(o => moment(o.created_date).isSameOrAfter(startDate)),
    [orders, startDate]
  );

  const validRevenueOrders = filtered.filter(o => o.status !== 'cancelled');
  const completed = filtered.filter(o => ['delivered', 'picked_up'].includes(o.status));
  const cancelled = filtered.filter(o => o.status === 'cancelled');
  const active = filtered.filter(o => ['new', 'awaiting_confirmation', 'in_preparation', 'ready', 'out_for_delivery'].includes(o.status));

  const revenue = validRevenueOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const avgTicket = validRevenueOrders.length > 0 ? revenue / validRevenueOrders.length : 0;
  const cancellationRate = filtered.length > 0 ? (cancelled.length / filtered.length) * 100 : 0;

  // Timeseries
  const series = useMemo(() => {
    const map = new Map();
    const now = moment();

    if (bucketBy === 'hour') {
      for (let h = 0; h < 24; h++) {
        const key = moment().startOf('day').add(h, 'hours').format('HH:mm');
        map.set(key, { label: key, revenue: 0, orders: 0 });
      }
      validRevenueOrders.forEach(o => {
        const key = moment(o.created_date).format('HH:00');
        const entry = map.get(key);
        if (entry) {
          entry.revenue += o.total_price || 0;
          entry.orders += 1;
        }
      });
    } else {
      const days = period === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = moment(now).subtract(i, 'days').startOf('day');
        const key = d.format('DD/MM');
        map.set(key, { label: key, revenue: 0, orders: 0 });
      }
      validRevenueOrders.forEach(o => {
        const key = moment(o.created_date).format('DD/MM');
        const entry = map.get(key);
        if (entry) {
          entry.revenue += o.total_price || 0;
          entry.orders += 1;
        }
      });
    }
    return Array.from(map.values());
  }, [validRevenueOrders, bucketBy, period]);

  // Top products
  const topProducts = useMemo(() => {
    const map = new Map();
    validRevenueOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const key = item.product_name || 'Item';
        const prev = map.get(key) || { name: key, qty: 0, revenue: 0 };
        prev.qty += item.quantity || 0;
        prev.revenue += item.subtotal || 0;
        map.set(key, prev);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [validRevenueOrders]);

  const maxTopQty = topProducts[0]?.qty || 1;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Period switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--gray-800)', letterSpacing: '-0.02em' }}>Métricas</h2>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
            {filtered.length} pedido{filtered.length !== 1 ? 's' : ''} no período
          </p>
        </div>
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          {PERIODS.map(p => (
            <button
              key={p.id}
              className={`tab-item ${period === p.id ? 'active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard
          label="Receita"
          value={CURRENCY(revenue)}
          sub={`${validRevenueOrders.length} pedidos válidos`}
          icon={DollarSign} color="var(--green-600)" bg="var(--green-50)"
        />
        <KpiCard
          label="Ticket Médio"
          value={CURRENCY(avgTicket)}
          sub="por pedido"
          icon={TrendingUp} color="var(--purple-600)" bg="var(--purple-50)"
        />
        <KpiCard
          label="Pedidos"
          value={filtered.length}
          sub={`${completed.length} concluídos · ${active.length} ativos`}
          icon={ShoppingBag} color="var(--blue-500)" bg="var(--blue-50)"
        />
        <KpiCard
          label="Cancelamentos"
          value={cancelled.length}
          sub={`${cancellationRate.toFixed(1)}% do total`}
          icon={XCircle} color="var(--red-500)" bg="var(--red-50)"
        />
      </div>

      {/* Status snapshot (somente hoje para relevância) */}
      {period === 'today' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          <KpiCard
            label="Novos"
            value={filtered.filter(o => o.status === 'new').length}
            icon={AlertCircle} color="var(--blue-500)" bg="var(--blue-50)"
          />
          <KpiCard
            label="Em Preparo"
            value={filtered.filter(o => o.status === 'in_preparation').length}
            icon={ChefHat} color="var(--orange-500)" bg="var(--orange-50)"
          />
          <KpiCard
            label="Pronto / Entrega"
            value={filtered.filter(o => ['ready', 'out_for_delivery'].includes(o.status)).length}
            icon={Truck} color="var(--purple-600)" bg="var(--purple-50)"
          />
          <KpiCard
            label="Concluídos"
            value={completed.length}
            icon={CheckCircle2} color="var(--green-600)" bg="var(--green-50)"
          />
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, marginBottom: 24 }} className="dashboard-charts">
        {/* Revenue chart */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Vendas no período</h3>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                  {period === 'today' ? 'Por hora' : 'Por dia'} · em R$
                </p>
              </div>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={series} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6d28d9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9898ac' }} tickLine={false} axisLine={{ stroke: '#ebebf0' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#9898ac' }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #ebebf0', boxShadow: 'var(--shadow-md)', fontSize: 12 }}
                    formatter={(v, n) => n === 'revenue' ? [CURRENCY(v), 'Receita'] : [v, 'Pedidos']}
                    labelStyle={{ color: '#6e6e82', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6d28d9" strokeWidth={2.5} fill="url(#revFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Trophy style={{ width: 16, height: 16, color: 'var(--yellow-500)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Mais vendidos</h3>
            </div>
            {topProducts.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--gray-400)', padding: '24px 0', textAlign: 'center' }}>
                Nenhum produto vendido no período
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topProducts.map((p, i) => (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                        {i + 1}. {p.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-600)' }}>
                        {p.qty}×
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--gray-100)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${(p.qty / maxTopQty) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6d28d9, #a78bfa)', borderRadius: 'var(--r-full)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3 }}>
                      {CURRENCY(p.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}