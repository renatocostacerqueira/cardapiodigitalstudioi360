import React, { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, MapPin, Navigation2 } from 'lucide-react';

function buildAddress(order) {
  return [order.address_street, order.address_number, order.address_neighborhood, order.address_city]
    .filter(Boolean).join(', ');
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getStatusMessage(distKm) {
  if (distKm === null) return { text: 'Seu pedido está a caminho! 🛵', color: 'var(--purple-600)' };
  if (distKm > 2) return { text: 'Entregador a caminho 🛵', color: 'var(--purple-600)' };
  if (distKm > 0.5) return { text: 'Entregador está próximo! 📍', color: 'var(--orange-500)' };
  return { text: 'Chegando agora! 🎉', color: 'var(--green-600)' };
}

function getETA(distKm) {
  if (distKm === null) return null;
  const avgSpeedKmH = 20;
  const minutes = Math.ceil((distKm / avgSpeedKmH) * 60);
  if (minutes <= 1) return 'Menos de 1 min';
  return `~${minutes} min`;
}

// Driver SVG marker icon
const DRIVER_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="18" fill="#6d28d9" stroke="white" stroke-width="3"/>
  <text x="20" y="26" text-anchor="middle" font-size="18">🛵</text>
</svg>`;

const CUSTOMER_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="18" fill="#16a34a" stroke="white" stroke-width="3"/>
  <text x="20" y="26" text-anchor="middle" font-size="18">🏠</text>
</svg>`;

export default function LiveTrackingMap({ order }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [customerCoords, setCustomerCoords] = useState(
    order.customer_lat && order.customer_lng
      ? { lat: order.customer_lat, lng: order.customer_lng }
      : null
  );
  const [driverCoords, setDriverCoords] = useState(
    order.driver_lat && order.driver_lng
      ? { lat: order.driver_lat, lng: order.driver_lng }
      : null
  );
  const [distance, setDistance] = useState(null);

  // Compute distance when both coords available
  useEffect(() => {
    if (customerCoords && driverCoords) {
      const d = haversineDistance(driverCoords.lat, driverCoords.lng, customerCoords.lat, customerCoords.lng);
      setDistance(d);
    }
  }, [driverCoords, customerCoords]);

  // Subscribe to order updates (driver location changes)
  useEffect(() => {
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      if (event.id === order.id && event.type !== 'delete') {
        const data = event.data;
        if (data.driver_lat && data.driver_lng) {
          setDriverCoords({ lat: data.driver_lat, lng: data.driver_lng });
        }
        if (data.customer_lat && data.customer_lng) {
          setCustomerCoords({ lat: data.customer_lat, lng: data.customer_lng });
        }
      }
    });
    return unsubscribe;
  }, [order.id]);

  // Update driver marker when coords change
  useEffect(() => {
    if (!driverMarkerRef.current || !driverCoords) return;
    driverMarkerRef.current.setPosition(driverCoords);
    // Pan map to keep both in view
    if (mapInstanceRef.current && customerCoords) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(driverCoords);
      bounds.extend(customerCoords);
      mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 40, bottom: 60, left: 40 });
    }
  }, [driverCoords, customerCoords]);

  const initMap = useCallback(async (apiKey, custCoords) => {
    if (!mapRef.current) return;

    const center = driverCoords || custCoords;
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });

    mapInstanceRef.current = map;

    const svgToDataUrl = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

    // Customer marker
    customerMarkerRef.current = new window.google.maps.Marker({
      position: custCoords,
      map,
      title: 'Seu endereço',
      icon: { url: svgToDataUrl(CUSTOMER_ICON_SVG), scaledSize: new window.google.maps.Size(40, 40) },
      animation: window.google.maps.Animation.DROP,
      zIndex: 1,
    });

    // Driver marker (if available)
    if (driverCoords) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverCoords,
        map,
        title: 'Entregador',
        icon: { url: svgToDataUrl(DRIVER_ICON_SVG), scaledSize: new window.google.maps.Size(40, 40) },
        zIndex: 2,
      });

      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(driverCoords);
      bounds.extend(custCoords);
      map.fitBounds(bounds, { top: 60, right: 40, bottom: 60, left: 40 });
    }

    setMapStatus('ready');
  }, [driverCoords]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const keyRes = await base44.functions.invoke('getMapsKey', {});
        const apiKey = keyRes.data?.apiKey;
        if (!apiKey) throw new Error('API key não disponível');

        // Geocode customer address if not cached
        let custCoords = customerCoords;
        if (!custCoords) {
          const address = buildAddress(order);
          const geoRes = await base44.functions.invoke('geocodeAddress', { address });
          if (geoRes.data?.error) throw new Error(geoRes.data.error);
          custCoords = { lat: geoRes.data.lat, lng: geoRes.data.lng };
          if (!cancelled) setCustomerCoords(custCoords);
          // Cache on order
          base44.entities.Order.update(order.id, { customer_lat: custCoords.lat, customer_lng: custCoords.lng });
        }

        if (cancelled) return;

        // Load Google Maps
        if (!window.google?.maps) {
          await new Promise((resolve, reject) => {
            if (document.getElementById('gmaps-script')) { resolve(); return; }
            const script = document.createElement('script');
            script.id = 'gmaps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar Google Maps'));
            document.head.appendChild(script);
          });
        }

        if (cancelled) return;
        await initMap(apiKey, custCoords);
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || 'Erro ao carregar mapa');
          setMapStatus('error');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const statusMsg = getStatusMessage(distance);
  const eta = getETA(distance);

  return (
    <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1.5px solid var(--purple-200)', background: '#fff' }}>
      {/* Status bar */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, var(--purple-600), var(--purple-800))',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🛵</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{statusMsg.text}</div>
            {distance !== null && (
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>
                {distance < 1
                  ? `${Math.round(distance * 1000)} m de distância`
                  : `${distance.toFixed(1)} km de distância`}
              </div>
            )}
          </div>
        </div>
        {eta && (
          <div style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--r-sm)',
            padding: '6px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 600 }}>CHEGADA</div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{eta}</div>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height: 280 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {mapStatus === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'var(--gray-50)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <Loader2 style={{ width: 26, height: 26, color: 'var(--purple-500)', animation: 'spin 0.65s linear infinite' }} />
            <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>Localizando entregador…</span>
          </div>
        )}

        {mapStatus === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'var(--gray-50)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, textAlign: 'center',
          }}>
            <AlertCircle style={{ width: 28, height: 28, color: 'var(--red-400)' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)' }}>Mapa indisponível</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{errorMsg}</div>
          </div>
        )}

        {/* No driver yet overlay */}
        {mapStatus === 'ready' && !driverCoords && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 14px',
            borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            📍 Aguardando localização do entregador…
          </div>
        )}
      </div>

      {/* Legend */}
      {mapStatus === 'ready' && (
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--gray-100)',
          display: 'flex', gap: 16, fontSize: 11, color: 'var(--gray-500)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>🏠</span> Seu endereço
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>🛵</span> Entregador
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-500)', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            Ao vivo
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}