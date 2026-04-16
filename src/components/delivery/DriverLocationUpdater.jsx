import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Navigation2, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';

const UPDATE_INTERVAL_MS = 8000; // 8 seconds between GPS pushes

export default function DriverLocationUpdater({ order, isActive }) {
  const [permissionState, setPermissionState] = useState('pending'); // pending | granted | denied
  const [lastLocation, setLastLocation] = useState(
    order.driver_lat && order.driver_lng
      ? { lat: order.driver_lat, lng: order.driver_lng }
      : null
  );
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const watchIdRef = useRef(null);
  const lastPushRef = useRef(0);

  // Throttled location push — only write to DB if enough time has passed
  const pushLocation = useCallback(async (lat, lng) => {
    const now = Date.now();
    if (now - lastPushRef.current < UPDATE_INTERVAL_MS) return;
    lastPushRef.current = now;

    await base44.entities.Order.update(order.id, {
      driver_lat: lat,
      driver_lng: lng,
      driver_location_updated_at: new Date().toISOString(),
    });
    setLastLocation({ lat, lng });
    setLastUpdated(new Date());
    setUpdateCount(c => c + 1);
  }, [order.id]);

  // Start watching GPS
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState('denied');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPermissionState('granted');
        pushLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setPermissionState('denied');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [pushLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Auto-start when active, stop when not
  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }
    return stopTracking;
  }, [isActive, startTracking, stopTracking]);

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  if (!isActive) return null;

  return (
    <div style={{
      background: permissionState === 'denied' ? '#fef2f2' : 'var(--purple-50)',
      border: `1.5px solid ${permissionState === 'denied' ? '#fecaca' : 'var(--purple-200)'}`,
      borderRadius: 'var(--r-md)', padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {permissionState === 'denied' ? (
          <>
            <WifiOff style={{ width: 14, height: 14, color: 'var(--red-500)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red-500)' }}>GPS negado — cliente não verá sua localização</span>
          </>
        ) : permissionState === 'granted' ? (
          <>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-500)', flexShrink: 0, animation: 'blink 1.5s infinite', display: 'inline-block' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple-800)' }}>
                📡 Rastreamento GPS Ativo
              </div>
              {lastLocation && (
                <div style={{ fontSize: 10, color: 'var(--purple-500)', marginTop: 1 }}>
                  {lastLocation.lat.toFixed(4)}, {lastLocation.lng.toFixed(4)}
                  {timeStr && ` · ${timeStr}`}
                  {updateCount > 0 && ` · ${updateCount} atualizações`}
                </div>
              )}
            </div>
            <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--green-500)', flexShrink: 0 }} />
          </>
        ) : (
          <>
            <Navigation2 style={{ width: 14, height: 14, color: 'var(--purple-500)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--purple-700)' }}>Aguardando permissão de GPS…</span>
          </>
        )}
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}