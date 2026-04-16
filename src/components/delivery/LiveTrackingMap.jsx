import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle } from 'lucide-react';

function buildAddress(order) {
  return [order.address_street, order.address_number, order.address_neighborhood, order.address_city]
    .filter(Boolean).join(', ');
}

const DRIVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="20" fill="#6d28d9" stroke="white" stroke-width="3"/>
  <text x="22" y="29" text-anchor="middle" font-size="20">🛵</text>
</svg>`;

const CUSTOMER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="20" fill="#16a34a" stroke="white" stroke-width="3"/>
  <text x="22" y="29" text-anchor="middle" font-size="20">🏠</text>
</svg>`;

function svgUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function LiveTrackingMap({ order }) {
  const mapRef = useRef(null);
  const mapRef2 = useRef(null); // actual DOM node
  const driverMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const lastRouteUpdateRef = useRef(0);

  const [mapStatus, setMapStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [eta, setEta] = useState(null);       // string e.g. "12 min"
  const [distance, setDistance] = useState(null); // string e.g. "2,3 km"
  const [statusMsg, setStatusMsg] = useState('Seu pedido está a caminho! 🛵');
  const [driverCoords, setDriverCoords] = useState(
    order.driver_lat && order.driver_lng ? { lat: order.driver_lat, lng: order.driver_lng } : null
  );
  const [customerCoords, setCustomerCoords] = useState(
    order.customer_lat && order.customer_lng ? { lat: order.customer_lat, lng: order.customer_lng } : null
  );

  // Compute status message from directions distance
  function updateStatusFromText(distText) {
    if (!distText) { setStatusMsg('Seu pedido está a caminho! 🛵'); return; }
    const km = parseFloat(distText.replace(',', '.').replace(/[^0-9.]/g, ''));
    if (km > 2) setStatusMsg('Entregador a caminho 🛵');
    else if (km > 0.5) setStatusMsg('Entregador está próximo! 📍');
    else setStatusMsg('Chegando agora! 🎉');
  }

  // Calculate real route via Directions API and update polyline + ETA
  const updateRoute = (driverPos, customerPos) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;
    const now = Date.now();
    if (now - lastRouteUpdateRef.current < 10000) return; // max every 10s
    lastRouteUpdateRef.current = now;

    directionsServiceRef.current.route(
      {
        origin: driverPos,
        destination: customerPos,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setEta(leg.duration.text);
            setDistance(leg.distance.text);
            updateStatusFromText(leg.distance.text);
          }
        }
      }
    );
  };

  // Move driver marker smoothly + update route
  const updateDriverPosition = (newPos) => {
    if (!mapRef.current) return;
    setDriverCoords(newPos);

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(newPos);
    } else if (mapRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: newPos,
        map: mapRef.current,
        title: 'Entregador',
        icon: { url: svgUrl(DRIVER_SVG), scaledSize: new window.google.maps.Size(44, 44) },
        zIndex: 2,
      });
    }

    // Adjust bounds to show both markers
    if (customerMarkerRef.current && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(newPos);
      bounds.extend(customerMarkerRef.current.getPosition());
      mapRef.current.fitBounds(bounds, { top: 80, right: 50, bottom: 80, left: 50 });
    }

    if (customerCoords) {
      updateRoute(newPos, customerCoords);
    }
  };

  // Subscribe to real-time order updates
  useEffect(() => {
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      if (event.id !== order.id || event.type === 'delete') return;
      const data = event.data;
      if (data.driver_lat && data.driver_lng) {
        updateDriverPosition({ lat: data.driver_lat, lng: data.driver_lng });
      }
    });
    return unsubscribe;
  }, [order.id, customerCoords]);

  // Initialize map
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Get API key
        const keyRes = await base44.functions.invoke('getMapsKey', {});
        const apiKey = keyRes.data?.apiKey;
        if (!apiKey) throw new Error('Chave de API não disponível');

        // Geocode customer address if not cached
        let custCoords = customerCoords;
        if (!custCoords) {
          const address = buildAddress(order);
          const geoRes = await base44.functions.invoke('geocodeAddress', { address });
          if (geoRes.data?.error) throw new Error(geoRes.data.error);
          custCoords = { lat: geoRes.data.lat, lng: geoRes.data.lng };
          if (!cancelled) setCustomerCoords(custCoords);
          // Cache geocode on order so we don't redo it
          base44.entities.Order.update(order.id, { customer_lat: custCoords.lat, customer_lng: custCoords.lng });
        }

        if (cancelled) return;

        // Load Google Maps JS with Directions API
        if (!window.google?.maps) {
          await new Promise((resolve, reject) => {
            if (document.getElementById('gmaps-script')) { resolve(); return; }
            const script = document.createElement('script');
            script.id = 'gmaps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar Google Maps'));
            document.head.appendChild(script);
          });
        }

        if (cancelled || !mapRef2.current) return;

        const center = driverCoords || custCoords;
        const map = new window.google.maps.Map(mapRef2.current, {
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

        mapRef.current = map;

        // Directions service + renderer
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true, // we use custom markers
          polylineOptions: {
            strokeColor: '#6d28d9',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        });

        // Customer marker
        customerMarkerRef.current = new window.google.maps.Marker({
          position: custCoords,
          map,
          title: 'Seu endereço',
          icon: { url: svgUrl(CUSTOMER_SVG), scaledSize: new window.google.maps.Size(44, 44) },
          animation: window.google.maps.Animation.DROP,
          zIndex: 1,
        });

        // Driver marker if we already have coords
        if (driverCoords) {
          driverMarkerRef.current = new window.google.maps.Marker({
            position: driverCoords,
            map,
            title: 'Entregador',
            icon: { url: svgUrl(DRIVER_SVG), scaledSize: new window.google.maps.Size(44, 44) },
            zIndex: 2,
          });
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(driverCoords);
          bounds.extend(custCoords);
          map.fitBounds(bounds, { top: 80, right: 50, bottom: 80, left: 50 });
          // Initial route
          updateRoute(driverCoords, custCoords);
        }

        if (!cancelled) setMapStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || 'Erro ao carregar mapa');
          setMapStatus('error');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []); // only on mount

  return (
    <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1.5px solid var(--purple-200)', background: '#fff' }}>
      {/* Top status bar */}
      <div style={{
        padding: '10px 14px',
        background: 'linear-gradient(135deg, #6d28d9, #4c1d95)',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🛵</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.3 }}>{statusMsg}</div>
            {distance && (
              <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>{distance} de distância</div>
            )}
          </div>
        </div>
        {eta ? (
          <div style={{
            background: 'rgba(255,255,255,0.18)', borderRadius: 10,
            padding: '5px 10px', textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ fontSize: 9, opacity: 0.75, fontWeight: 600, letterSpacing: '0.05em' }}>CHEGADA</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{eta}</div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 10,
            padding: '5px 10px', textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ fontSize: 9, opacity: 0.75, fontWeight: 600 }}>CALCULANDO</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>ETA…</div>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height: 280 }}>
        <div ref={mapRef2} style={{ width: '100%', height: '100%' }} />

        {mapStatus === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, background: '#f8f8fa',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <Loader2 style={{ width: 26, height: 26, color: '#6d28d9', animation: 'spin 0.65s linear infinite' }} />
            <span style={{ fontSize: 13, color: '#6e6e82', fontWeight: 600 }}>Localizando entregador…</span>
          </div>
        )}

        {mapStatus === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, background: '#f8f8fa',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, textAlign: 'center',
          }}>
            <AlertCircle style={{ width: 28, height: 28, color: '#f87171' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#32324a' }}>Mapa indisponível</div>
            <div style={{ fontSize: 12, color: '#9898ac' }}>{errorMsg}</div>
          </div>
        )}

        {/* Waiting for driver pill */}
        {mapStatus === 'ready' && !driverCoords && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '6px 14px',
            borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            📡 Aguardando localização do entregador…
          </div>
        )}

        {/* Live indicator */}
        {mapStatus === 'ready' && driverCoords && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(255,255,255,0.95)', borderRadius: 999,
            padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 700, color: '#16a34a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            AO VIVO
          </div>
        )}
      </div>

      {/* Legend */}
      {mapStatus === 'ready' && (
        <div style={{
          padding: '8px 14px', borderTop: '1px solid #f1f1f5',
          display: 'flex', gap: 16, fontSize: 11, color: '#9898ac',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span>🏠</span> Seu endereço</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span>🛵</span> Entregador</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 24, height: 4, background: '#6d28d9', borderRadius: 2, opacity: 0.7 }} />
            Rota
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>
    </div>
  );
}