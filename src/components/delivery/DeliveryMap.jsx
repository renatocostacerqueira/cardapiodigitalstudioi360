import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, AlertCircle, Navigation, ExternalLink } from 'lucide-react';

function buildAddress(order) {
  return [
    order.address_street,
    order.address_number,
    order.address_neighborhood,
    order.address_city,
  ].filter(Boolean).join(', ');
}

function buildMapsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export default function DeliveryMap({ order, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [coords, setCoords] = useState(null);

  const address = buildAddress(order);
  const mapsUrl = buildMapsUrl(address);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Get API key
        const keyRes = await base44.functions.invoke('getMapsKey', {});
        const apiKey = keyRes.data?.apiKey;
        if (!apiKey) throw new Error('Chave de API não disponível');

        // 2. Geocode address
        const geoRes = await base44.functions.invoke('geocodeAddress', { address });
        if (geoRes.data?.error) throw new Error(geoRes.data.error);
        const { lat, lng } = geoRes.data;
        if (cancelled) return;
        setCoords({ lat, lng });

        // 3. Load Google Maps script if not already loaded
        if (!window.google?.maps) {
          await new Promise((resolve, reject) => {
            if (document.getElementById('gmaps-script')) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.id = 'gmaps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar Google Maps'));
            document.head.appendChild(script);
          });
        }

        if (cancelled) return;

        // 4. Init map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: order.customer_name,
          animation: window.google.maps.Animation.DROP,
        });

        mapInstanceRef.current = map;
        if (!cancelled) setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || 'Erro ao carregar mapa');
          setStatus('error');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [address]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 'var(--r-xl)',
        width: '100%', maxWidth: 560,
        overflow: 'hidden', boxShadow: 'var(--shadow-xl)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>{order.customer_name}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin style={{ width: 12, height: 12 }} />
              {address}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--r-sm)',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Map area */}
        <div style={{ position: 'relative', height: 320, background: 'var(--gray-100)' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {status === 'loading' && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', gap: 10,
            }}>
              <Loader2 style={{ width: 28, height: 28, color: 'var(--purple-500)', animation: 'spin 0.65s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>Carregando mapa…</span>
            </div>
          )}

          {status === 'error' && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, textAlign: 'center',
            }}>
              <AlertCircle style={{ width: 32, height: 32, color: 'var(--red-400)' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)' }}>Não foi possível carregar o mapa</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{errorMsg}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', display: 'flex', gap: 10, borderTop: '1px solid var(--gray-100)' }}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 0', borderRadius: 'var(--r-full)',
              background: 'var(--purple-600)', color: '#fff',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(109,40,217,0.30)',
            }}
          >
            <Navigation style={{ width: 16, height: 16 }} />
            Abrir Rota
            <ExternalLink style={{ width: 13, height: 13, opacity: 0.7 }} />
          </a>
          <button onClick={onClose} style={{
            padding: '11px 20px', borderRadius: 'var(--r-full)',
            background: 'var(--gray-100)', border: 'none',
            fontSize: 14, fontWeight: 600, color: 'var(--gray-600)', cursor: 'pointer',
          }}>
            Fechar
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}