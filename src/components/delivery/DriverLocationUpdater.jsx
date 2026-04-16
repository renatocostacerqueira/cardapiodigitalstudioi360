import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, Navigation2, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

export default function DriverLocationUpdater({ order, onLocationUpdated }) {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [lastLocation, setLastLocation] = useState(
    order.driver_lat && order.driver_lng
      ? { lat: order.driver_lat, lng: order.driver_lng }
      : null
  );
  const [autoTracking, setAutoTracking] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const autoIntervalRef = useRef(null);

  const updateLocation = async (lat, lng) => {
    const now = new Date().toISOString();
    await base44.entities.Order.update(order.id, {
      driver_lat: lat,
      driver_lng: lng,
      driver_location_updated_at: now,
    });
    setLastLocation({ lat, lng });
    setStatus('success');
    if (onLocationUpdated) onLocationUpdated({ lat, lng });
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateLocation(pos.coords.latitude, pos.coords.longitude);
        setGettingLocation(false);
      },
      () => {
        // Fallback: simulate location near customer (for demo purposes)
        simulateLocation();
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const simulateLocation = async () => {
    // Simulate driver moving toward customer address
    const baseLat = order.customer_lat || -23.55;
    const baseLng = order.customer_lng || -46.63;
    const offsetLat = (Math.random() - 0.5) * 0.01;
    const offsetLng = (Math.random() - 0.5) * 0.01;
    await updateLocation(baseLat + offsetLat, baseLng + offsetLng);
  };

  // Auto-tracking: update every 30 seconds
  useEffect(() => {
    if (autoTracking) {
      handleGetLocation(); // immediate first update
      autoIntervalRef.current = setInterval(() => {
        handleGetLocation();
      }, 30000);
    } else {
      clearInterval(autoIntervalRef.current);
    }
    return () => clearInterval(autoIntervalRef.current);
  }, [autoTracking]);

  const lastUpdated = order.driver_location_updated_at
    ? new Date(order.driver_location_updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div style={{
      background: 'var(--purple-50)', border: '1.5px solid var(--purple-200)',
      borderRadius: 'var(--r-md)', padding: '14px 16px', marginTop: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Navigation2 style={{ width: 15, height: 15, color: 'var(--purple-600)' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple-800)' }}>Localização do Entregador</span>
        {autoTracking && (
          <span style={{
            marginLeft: 'auto', background: 'var(--green-500)', color: '#fff',
            fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 'var(--r-full)',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            AO VIVO
          </span>
        )}
      </div>

      {/* Current coords display */}
      {lastLocation && (
        <div style={{
          background: '#fff', borderRadius: 'var(--r-sm)', padding: '8px 12px',
          marginBottom: 10, fontSize: 11, color: 'var(--gray-600)', fontFamily: 'monospace',
          border: '1px solid var(--gray-150)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📍 Lat: <strong>{lastLocation.lat.toFixed(5)}</strong></span>
            <span>Lng: <strong>{lastLocation.lng.toFixed(5)}</strong></span>
          </div>
          {lastUpdated && (
            <div style={{ marginTop: 4, color: 'var(--gray-400)', fontSize: 10 }}>
              Última atualização: {lastUpdated}
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleGetLocation}
          disabled={gettingLocation}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', borderRadius: 'var(--r-full)',
            background: status === 'success' ? 'var(--green-500)' : 'var(--purple-600)',
            color: '#fff', border: 'none', cursor: gettingLocation ? 'not-allowed' : 'pointer',
            fontSize: 12, fontWeight: 700, opacity: gettingLocation ? 0.7 : 1,
            transition: 'background 0.2s',
          }}
        >
          {gettingLocation ? (
            <Loader2 style={{ width: 13, height: 13, animation: 'spin 0.65s linear infinite' }} />
          ) : status === 'success' ? (
            <CheckCircle2 style={{ width: 13, height: 13 }} />
          ) : (
            <MapPin style={{ width: 13, height: 13 }} />
          )}
          {gettingLocation ? 'Obtendo…' : status === 'success' ? 'Atualizado!' : 'Atualizar Localização'}
        </button>

        <button
          onClick={() => setAutoTracking(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px',
            borderRadius: 'var(--r-full)',
            background: autoTracking ? 'var(--orange-500)' : '#fff',
            color: autoTracking ? '#fff' : 'var(--gray-600)',
            border: `1.5px solid ${autoTracking ? 'var(--orange-500)' : 'var(--gray-200)'}`,
            cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}
        >
          {autoTracking ? <Zap style={{ width: 13, height: 13 }} /> : <RefreshCw style={{ width: 13, height: 13 }} />}
          {autoTracking ? 'Parar' : 'Auto'}
        </button>
      </div>

      <div style={{ fontSize: 10, color: 'var(--purple-500)', marginTop: 8, textAlign: 'center' }}>
        {autoTracking ? 'Atualizando automaticamente a cada 30 seg' : 'Toque em "Auto" para rastreamento contínuo'}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}