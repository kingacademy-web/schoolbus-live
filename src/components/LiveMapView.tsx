import React, { useEffect, useRef, useState } from 'react';
import {
  Navigation,
  Phone,
  Crosshair,
  Plus,
  Compass,
  AlertTriangle,
  Play,
  Pause,
  Smartphone,
  CheckCircle,
  Radio,
  Clock,
  Car,
  Headphones,
  Check,
  X,
  MapPin,
  School,
  UserCheck,
  LocateFixed,
  Layers,
  Maximize2,
  Loader2,
} from 'lucide-react';
import L from 'leaflet';
import { store, calculateDistanceKm } from '../services/store';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface LiveMapViewProps {
  lang: Language;
}

type MapLayerMode = 'google_roads' | 'google_satellite' | 'osm';

export const LiveMapView: React.FC<LiveMapViewProps> = ({ lang }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [trafficActive, setTrafficActive] = useState(true);
  const [mapLayer, setMapLayer] = useState<MapLayerMode>('google_roads');
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  // Subscribe to reactive store updates (so hardware GPS, driver updates, simulation move smoothly)
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const student = store.getStudent();
  const bus = store.getBus();
  const driver = store.getDriver();
  const pickupPoint = store.getPickupPoint();
  const liveLocation = store.liveLocation;

  // Trigger toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Switch map tile layer
  const switchMapLayer = (mode: MapLayerMode) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    let layer: L.TileLayer;
    if (mode === 'google_satellite') {
      layer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps (Satellite)',
      });
    } else if (mode === 'osm') {
      layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      });
    } else {
      // Default: Google Roads (lightning-fast, clean, crisp Indian roads, zero API key)
      layer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps',
      });
    }

    layer.addTo(map);
    activeTileLayerRef.current = layer;
    setMapLayer(mode);

    const label =
      mode === 'google_roads'
        ? (lang === 'te' ? 'గూగుల్ రోడ్స్ మ్యాప్' : 'Google Roads Map')
        : mode === 'google_satellite'
        ? (lang === 'te' ? 'శాటిలైట్ హైబ్రిడ్ మ్యాప్' : 'Satellite Hybrid Map')
        : (lang === 'te' ? 'ఓపెన్‌స్ట్రీట్ మ్యాప్' : 'OpenStreetMap');
    showToast(label);
  };

  // Locate user's real physical location using browser navigator.geolocation
  const handleLocateUser = (panTo: boolean = true) => {
    if (!navigator.geolocation) {
      showToast(lang === 'te' ? 'మీ బ్రౌజర్‌లో GPS సదుపాయం లేదు.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 20);
        setUserLocation({ lat, lng, accuracy });

        const map = mapInstanceRef.current;
        if (!map) return;

        const distToBus = calculateDistanceKm(lat, lng, liveLocation.lat, liveLocation.lng);

        // Custom User Live Pin (High-visibility pulsating blue dot)
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center; transform: translate(-50%, -50%);">
              <div style="position:absolute; inset:0; border-radius:50%; background:rgba(37,99,235,0.35); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="width:20px; height:20px; border-radius:50%; background:#2563EB; border:3.5px solid white; box-shadow:0 3px 10px rgba(0,0,0,0.4); z-index:2;"></div>
              <div style="position:absolute; top:-22px; background:#1E3A8A; color:white; font-size:10px; font-weight:800; padding:2px 7px; border-radius:99px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.4);">
                📍 ${lang === 'te' ? 'మీరు' : 'You'}
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const popupHtml = `
          <div style="font-family:inherit; min-width:150px; padding:2px;">
            <div style="font-size:13px; font-weight:800; color:#1E3A8A; margin-bottom:3px; display:flex; align-items:center; gap:4px;">
              <span>📍 ${lang === 'te' ? 'మీ ప్రస్తుత లొకేషన్' : 'Your Current Location'}</span>
            </div>
            <div style="font-size:11px; color:#444651; margin-bottom:4px;">
              ${lang === 'te' ? 'GPS ఖచ్చితత్వం' : 'Accuracy'}: ±${accuracy}m
            </div>
            <div style="font-size:11px; font-weight:bold; color:#00236F; padding-top:4px; border-top:1px solid #E2E7FF;">
              ${lang === 'te' ? 'బస్సు నుండి దూరం' : 'Distance to Bus'}: <strong>${distToBus} km</strong>
            </div>
          </div>
        `;

        if (!userMarkerRef.current) {
          userMarkerRef.current = L.marker([lat, lng], {
            icon: userIcon,
            zIndexOffset: 950,
          })
            .addTo(map)
            .bindPopup(popupHtml);
        } else {
          userMarkerRef.current.setLatLng([lat, lng]);
          userMarkerRef.current.setIcon(userIcon);
          userMarkerRef.current.setPopupContent(popupHtml);
        }

        // Accuracy Halo circle
        if (!userCircleRef.current) {
          userCircleRef.current = L.circle([lat, lng], {
            radius: Math.max(accuracy, 25),
            color: '#2563EB',
            weight: 1.5,
            fillColor: '#3B82F6',
            fillOpacity: 0.15,
          }).addTo(map);
        } else {
          userCircleRef.current.setLatLng([lat, lng]);
          userCircleRef.current.setRadius(Math.max(accuracy, 25));
        }

        if (panTo) {
          map.flyTo([lat, lng], 16, { duration: 1 });
          userMarkerRef.current.openPopup();
          showToast(
            lang === 'te'
              ? '✅ మీ ప్రస్తుత లొకేషన్ గుర్తించబడింది!'
              : '✅ Current location found!'
          );
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        if (panTo) {
          showToast(
            lang === 'te'
              ? 'లొకేషన్ యాక్సెస్ తిరస్కరించబడింది. దయచేసి ఫోన్‌లో GPS అనుమతించండి.'
              : 'Location permission denied. Please allow GPS access in settings.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  };

  // Fit bounds to show User, Bus, School, and Pickup point all at once
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const points: [number, number][] = [
      [liveLocation.lat, liveLocation.lng],
      [17.8580, 79.3175], // School campus Station Ghanpur
    ];
    if (pickupPoint?.lat && pickupPoint?.lng) {
      points.push([pickupPoint.lat, pickupPoint.lng]);
    }
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    map.fitBounds(points, { padding: [50, 50], maxZoom: 16 });
    showToast(lang === 'te' ? 'మొత్తం రూట్ సర్దుబాటు చేయబడింది' : 'Full route view aligned');
  };

  // Initialize interactive Leaflet map & ensure container sizing is never 0
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Station Ghanpur coordinates default
      const initialLat = liveLocation.lat || 17.854;
      const initialLng = liveLocation.lng || 79.314;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
      });

      // Default: Google Maps Roads tile layer (fast, clean, 100% free, no API key, no watermark)
      const initialTile = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps',
      }).addTo(map);

      activeTileLayerRef.current = initialTile;
      mapInstanceRef.current = map;

      // 1. School Campus Destination Marker (Sri Chaitanya School, Station Ghanpur)
      const campusLabel = lang === 'te' ? store.schoolInfo.nameTe : store.schoolInfo.name;
      const schoolIcon = L.divIcon({
        className: 'custom-school-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
            <div style="background:white; color:#00236F; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius:12px; padding:4px 8px; font-size:11px; font-weight:bold; display:flex; align-items:center; gap:4px; border:1px solid #E2E7FF; white-space:nowrap;">
              <span>🏫 ${campusLabel}</span>
            </div>
            <div style="width:30px; height:30px; background:#00236F; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.25); margin-top:2px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
      });
      L.marker([17.8580, 79.3175], { icon: schoolIcon }).addTo(map);

      // 2. Pickup Point Marker (Sadvik Stop) + 500m Safety Perimeter Circle
      if (pickupPoint) {
        const pickupIcon = L.divIcon({
          className: 'custom-pickup-marker',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
              <div style="background:#FEA619; color:#684000; box-shadow: 0 6px 16px rgba(254,166,25,0.35); border-radius:12px; padding:4px 8px; font-size:11px; font-weight:800; display:flex; align-items:center; gap:4px; white-space:nowrap;">
                <span>👶 Sadvik Pickup</span>
              </div>
              <div style="background:rgba(255,255,255,0.9); backdrop-filter:blur(4px); color:#855300; font-size:9px; font-weight:bold; padding:1px 6px; border-radius:99px; margin-top:2px; box-shadow:0 1px 4px rgba(0,0,0,0.1);">
                500M ZONE
              </div>
              <div style="width:34px; height:34px; background:#855300; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(0,0,0,0.3); margin-top:2px; border:2px solid white;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            </div>
          `,
          iconSize: [40, 60],
          iconAnchor: [20, 60],
        });
        L.marker([pickupPoint.lat, pickupPoint.lng], { icon: pickupIcon }).addTo(map);

        // 500m Safety Perimeter Geofence Circle
        const circle = L.circle([pickupPoint.lat, pickupPoint.lng], {
          radius: pickupPoint.geofenceRadiusMeters || 500,
          color: '#FEA619',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#FFDDB8',
          fillOpacity: 0.22,
        }).addTo(map);
        geofenceCircleRef.current = circle;
      }

      // 3. Station Ghanpur Route Polylines
      const routeCoordinates: [number, number][] = [
        [17.8450, 79.3010], // Jangaon-Ghanpur Highway approach
        [17.8485, 79.3060], // Bypass Junction
        [17.8510, 79.3090], // Town Entry
        [17.8518, 79.3105], // 500m zone entry
        [17.8520, 79.3110], // Sadvik Pickup Stop
        [17.8545, 79.3135], // Railway Station Road
        [17.8580, 79.3175], // Sri Chaitanya School Campus
      ];

      // Road pathway base line
      L.polyline(routeCoordinates, {
        color: '#CBD5E1',
        weight: 10,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Covered Trajectory (Navy Blue)
      L.polyline(routeCoordinates.slice(0, 3), {
        color: '#1E3A8A',
        weight: 6,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Remaining Trajectory (Dashed Safety Amber)
      L.polyline(routeCoordinates.slice(2), {
        color: '#FEA619',
        weight: 5,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // Attempt silent geolocation on initial load so user pin shows up
    if (navigator.geolocation && !userLocation) {
      handleLocateUser(false);
    }
  }, []);

  // Guarantee tile fetching by invalidating size across layout changes and resize
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    ro.observe(mapContainerRef.current);

    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
    const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 800);

    const handleResize = () => mapInstanceRef.current?.invalidateSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Update Live Bus Marker on coordinate changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !liveLocation.lat || !liveLocation.lng) return;

    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%); position:relative;">
          <!-- Radar Radiance Ring -->
          <div style="position:absolute; inset:-12px; border-radius:50%; background:rgba(254,166,25,0.35); animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events:none;"></div>
          
          <!-- Bus Tag Pill -->
          <div style="background:#00236F; color:white; border-radius:99px; padding:3px 8px; box-shadow:0 4px 12px rgba(0,0,0,0.25); display:flex; align-items:center; gap:4px; font-size:11px; font-weight:800; white-space:nowrap; margin-bottom:4px; z-index:2;">
            <span style="width:6px; height:6px; border-radius:50%; background:#6FFBBE;"></span>
            <span>${bus?.busNumber || 'BUS-07'}</span>
            <span style="color:#B6C4FF; font-size:10px; margin-left:2px;">${liveLocation.speed} km/h</span>
          </div>

          <!-- Bus Avatar Pin with Heading Compass Arrow -->
          <div style="width:46px; height:46px; border-radius:16px; background:#FEA619; color:#684000; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(0,0,0,0.3); border:2px solid white; position:relative; z-index:1;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
            <!-- Heading Indicator Arrow -->
            <div style="position:absolute; top:-4px; right:-4px; width:18px; height:18px; border-radius:50%; background:#00236F; color:white; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 4px rgba(0,0,0,0.2);">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [50, 70],
      iconAnchor: [25, 35],
    });

    if (!busMarkerRef.current) {
      busMarkerRef.current = L.marker([liveLocation.lat, liveLocation.lng], {
        icon: busIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      busMarkerRef.current.setLatLng([liveLocation.lat, liveLocation.lng]);
      busMarkerRef.current.setIcon(busIcon);
    }
  }, [liveLocation.lat, liveLocation.lng, liveLocation.speed, bus?.busNumber]);

  // Recenter on bus
  const handleRecenterBus = () => {
    if (mapInstanceRef.current && liveLocation.lat && liveLocation.lng) {
      mapInstanceRef.current.flyTo([liveLocation.lat, liveLocation.lng], 15, {
        duration: 0.8,
      });
      showToast(`${getTranslation(lang, 'centerBus')}: ${bus?.busNumber}`);
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  const handleToggleTraffic = () => {
    setTrafficActive(!trafficActive);
    showToast(
      trafficActive
        ? 'Traffic Flow Overlay Hidden'
        : 'Live Traffic Flow Overlay Active'
    );
  };

  const handleAtStopAlert = () => {
    if (student) {
      store.updateStudentStatus(student.id, 'At Stop');
      showToast(
        lang === 'te'
          ? 'డ్రైవర్‌కు నోటిఫికేషన్ వెళ్ళింది: సాద్విక్ స్టాప్ వద్ద ఉన్నారు!'
          : 'Driver alerted: Sadvik is waiting at stop!',
      );
    }
  };

  return (
    <div className="flex flex-col w-full relative select-none pb-20">
      {/* Toast Notification Bar for Tactile Feedback */}
      {toastMessage && (
        <div className="fixed top-22 left-1/2 -translate-x-1/2 z-50 bg-[#131B2E] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#E2E7FF]/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-[#4EDEA3]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Interactive Live Map Viewport Area */}
      <div className="relative w-full h-[470px] sm:h-[520px] bg-[#E2E7FF] overflow-hidden shadow-inner">
        {/* Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0"
          style={{ minHeight: '450px', height: '100%', width: '100%', position: 'relative' }}
        />

        {/* Floating Top Realtime Telemetry HUD Card */}
        <div className="absolute top-3 left-3 right-3 z-20">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 flex flex-col gap-2 border border-[#E2E7FF]">
            {/* Top Status Bar Row */}
            <div className="flex items-center justify-between">
              {/* Live GPS State Chip */}
              <div className="flex items-center gap-1.5 bg-[#004A31]/10 text-[#004A31] px-3 py-1 rounded-full border border-[#004A31]/20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C38A] animate-pulse" />
                <div className="flex items-center gap-1 text-xs font-extrabold tracking-wide">
                  <span>{getTranslation(lang, 'liveGpsPill')}</span>
                  {liveLocation.isRealGps && (
                    <span className="text-[10px] bg-[#27C38A]/20 px-1 rounded text-[#004A31]">
                      HW
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Age & Precision */}
              <div className="flex items-center gap-1.5 text-[#444651] text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 text-[#4059AA] animate-pulse" />
                <span>{getTranslation(lang, 'updatedAgo')} 4s ago</span>
                <span className="text-[10px] bg-[#EAEDFF] text-[#00236F] px-1.5 py-0.5 rounded font-mono font-bold">
                  ±3m
                </span>
              </div>
            </div>

            {/* Metric Split: Distance & ETA (High Contrast for Outdoor Sunlight) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="bg-[#F2F3FF] rounded-xl p-2.5 flex items-center gap-2.5 border border-[#E2E7FF]">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#444651] font-bold uppercase tracking-wider truncate">
                    {getTranslation(lang, 'distance')}
                  </span>
                  <span className="text-lg font-black text-[#00236F] tracking-tight truncate">
                    {liveLocation.distanceKm} km
                  </span>
                </div>
              </div>

              <div className="bg-[#FEA619]/15 rounded-xl p-2.5 flex items-center gap-2.5 border border-[#FEA619]/30">
                <div className="w-9 h-9 rounded-xl bg-[#FEA619] text-[#684000] flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#684000] font-bold uppercase tracking-wider truncate">
                    {getTranslation(lang, 'eta')}
                  </span>
                  <span className="text-lg font-black text-[#855300] tracking-tight truncate">
                    {liveLocation.etaMinutes} {getTranslation(lang, 'mins')}
                  </span>
                </div>
              </div>
            </div>

            {/* User Distance Badge (Calculated in real-time when user location is known) */}
            {userLocation && (
              <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#1E3A8A] font-bold">
                  <LocateFixed className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>
                    {lang === 'te' ? 'మీ స్థానం నుండి బస్సు దూరం' : 'Bus distance from you'}:
                  </span>
                </div>
                <span className="text-xs font-black text-[#1E3A8A] bg-white px-2 py-0.5 rounded-md shadow-2xs">
                  {calculateDistanceKm(userLocation.lat, userLocation.lng, liveLocation.lat, liveLocation.lng)} km
                </span>
              </div>
            )}

            {/* Micro Status Progress Ribbon */}
            <div className="flex items-center justify-between px-1 pt-0.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#131B2E] font-semibold truncate">
                <CheckCircle className="w-3.5 h-3.5 text-[#004A31] shrink-0" />
                <span className="truncate">
                  {getTranslation(lang, 'nextStop')}:{' '}
                  <strong>{pickupPoint?.name || 'Sadvik Pickup (Main Rd)'}</strong>
                </span>
              </div>
              <span className="text-[10px] bg-[#EAEDFF] text-[#00236F] px-2 py-0.5 rounded-full font-bold shrink-0">
                Stop #03
              </span>
            </div>
          </div>
        </div>

        {/* Floating Map Control FAB Stack (Right Edge) */}
        <div className="absolute right-3 bottom-6 z-20 flex flex-col gap-2">
          {/* 📍 My Location Button (Dedicated Device GPS Finder) */}
          <button
            type="button"
            onClick={() => handleLocateUser(true)}
            disabled={isLocating}
            className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform border ${
              userLocation
                ? 'bg-[#2563EB] text-white border-[#1E3A8A] ring-2 ring-[#93C5FD]'
                : 'bg-white text-[#2563EB] border-[#E2E7FF] hover:bg-blue-50'
            }`}
            title={lang === 'te' ? 'నా ప్రస్తుత లొకేషన్ చూపించు' : 'Find My Current Location'}
            aria-label="My Location"
          >
            {isLocating ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
            ) : (
              <LocateFixed className="w-6 h-6" />
            )}
          </button>

          {/* 🎯 Recenter Live Bus Location */}
          <button
            type="button"
            onClick={handleRecenterBus}
            className="w-12 h-12 rounded-2xl bg-white text-[#00236F] shadow-lg flex items-center justify-center active:scale-90 transition-transform border border-[#E2E7FF] hover:bg-gray-50"
            title={getTranslation(lang, 'centerBus')}
            aria-label={getTranslation(lang, 'centerBus')}
          >
            <Crosshair className="w-6 h-6" />
          </button>

          {/* 🔲 Fit All Bounds (User + Bus + School) */}
          <button
            type="button"
            onClick={handleFitAll}
            className="w-12 h-12 rounded-2xl bg-white text-[#444651] shadow-lg flex items-center justify-center active:scale-90 transition-transform border border-[#E2E7FF] hover:bg-gray-50"
            title={lang === 'te' ? 'మొత్తం రూట్ సర్దుబాటు చేయి' : 'Fit Entire Route'}
            aria-label="Fit All"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* 🗺️ Map Layer Switcher (Roads / Satellite / OSM) */}
          <button
            type="button"
            onClick={() => {
              if (mapLayer === 'google_roads') switchMapLayer('google_satellite');
              else if (mapLayer === 'google_satellite') switchMapLayer('osm');
              else switchMapLayer('google_roads');
            }}
            className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform border border-[#E2E7FF] ${
              mapLayer === 'google_satellite'
                ? 'bg-[#00236F] text-white'
                : 'bg-white text-[#444651] hover:bg-gray-50'
            }`}
            title={
              mapLayer === 'google_roads'
                ? 'Map: Roads'
                : mapLayer === 'google_satellite'
                ? 'Map: Satellite'
                : 'Map: OpenStreetMap'
            }
            aria-label="Toggle Map Layer"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* ➕ Zoom In Control */}
          <button
            type="button"
            onClick={() => handleZoom(1)}
            className="w-12 h-12 rounded-2xl bg-white text-[#131B2E] shadow-lg flex items-center justify-center active:scale-90 transition-transform border border-[#E2E7FF] hover:bg-gray-50"
            aria-label={getTranslation(lang, 'zoomIn')}
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* 🚗 Traffic Layer Toggle */}
          <button
            type="button"
            onClick={handleToggleTraffic}
            className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform border border-[#E2E7FF] ${
              trafficActive ? 'bg-[#FEA619] text-[#684000]' : 'bg-white text-[#444651]'
            }`}
            aria-label={getTranslation(lang, 'trafficLayer')}
          >
            <Car className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Draggable Bottom Sheet Card Panel */}
      <div className="w-full bg-white rounded-t-3xl shadow-2xl px-4 pt-3 pb-8 -mt-5 relative z-30 flex flex-col gap-3.5 border-t border-[#E2E7FF]">
        {/* Tactile Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-[#C5C5D3] self-center mb-0.5" />

        {/* Bus & Driver Primary Credentials Section */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={driver?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                alt={driver?.name}
                className="w-12 h-12 rounded-2xl object-cover shadow-xs border-2 border-[#EAEDFF]"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#004A31] text-white flex items-center justify-center ring-2 ring-white">
                <Check className="w-3 h-3 text-[#4EDEA3]" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#131B2E] truncate">
                  {lang === 'te' ? driver?.nameTe : driver?.name}
                </span>
                <span className="text-xs bg-[#FFDDB8] text-[#2A1700] px-2 py-0.5 rounded-full font-bold shrink-0">
                  {bus?.busNumber || 'BUS-07'}
                </span>
              </div>
              <span className="text-xs text-[#444651] truncate">
                {lang === 'te' ? 'రవి కుమార్ • 12 సం. అనుభవం' : `${driver?.name} • 12 Yrs Safe Driving`}
              </span>
            </div>
          </div>

          {/* Quick Phone Direct Dialer */}
          <a
            href={`tel:${driver?.phone || '+919876543210'}`}
            className="w-11 h-11 rounded-2xl bg-[#00236F] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform shrink-0"
            aria-label="Call Driver"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>

        {/* Telematics Context Ribbon */}
        <div className="bg-[#F2F3FF] rounded-2xl p-3 flex flex-col gap-2.5 border border-[#E2E7FF]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2E7FF] text-[#00236F] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#444651]">
                {getTranslation(lang, 'currentLocation')}
              </span>
              <span className="text-sm font-bold text-[#131B2E] truncate">
                {lang === 'te' ? liveLocation.locationNameTe : liveLocation.locationName}
              </span>
              <span className="text-xs text-[#444651]">
                {lang === 'te' ? 'గచ్చిబౌలి ఔటర్ రింగ్ రోడ్ మార్గం' : 'Outer Ring Road, Gachibowli Corridor'}
              </span>
            </div>
          </div>

          {/* Telematics Row: Speed, Congestion, On Board */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E2E7FF]/70">
            <div className="bg-white rounded-xl p-2 flex flex-col items-center text-center shadow-2xs border border-[#E2E7FF]">
              <span className="text-[10px] text-[#444651] font-semibold">
                {getTranslation(lang, 'speed')}
              </span>
              <span className="text-base font-extrabold text-[#131B2E]">
                {liveLocation.speed}{' '}
                <span className="text-[10px] font-normal text-[#444651]">km/h</span>
              </span>
              <span className="text-[9px] font-bold text-[#004A31]">
                {getTranslation(lang, 'normalPace')}
              </span>
            </div>

            <div className="bg-white rounded-xl p-2 flex flex-col items-center text-center shadow-2xs border border-[#E2E7FF]">
              <span className="text-[10px] text-[#444651] font-semibold">
                {getTranslation(lang, 'traffic')}
              </span>
              <span className="text-base font-extrabold text-[#855300]">
                {getTranslation(lang, 'moderateTraffic')}
              </span>
              <span className="text-[9px] font-bold text-[#855300]">+2 min delay</span>
            </div>

            <div className="bg-white rounded-xl p-2 flex flex-col items-center text-center shadow-2xs border border-[#E2E7FF]">
              <span className="text-[10px] text-[#444651] font-semibold">
                {getTranslation(lang, 'onBoard')}
              </span>
              <span className="text-base font-extrabold text-[#00236F]">18/24</span>
              <span className="text-[9px] font-bold text-[#444651]">Attendant On</span>
            </div>
          </div>
        </div>

        {/* Student Status Pill Banner */}
        <div className="bg-[#FFDDB8]/40 rounded-2xl p-2.5 flex items-center justify-between border border-[#FFDDB8]">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={student?.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
              alt={student?.name}
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#FEA619]"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#131B2E] truncate">
                  {lang === 'te' ? student?.nameTe : student?.name}
                </span>
                <span className="text-[10px] bg-[#FEA619] text-[#684000] px-1.5 py-0.2 rounded font-bold">
                  Class 1-A
                </span>
              </div>
              <span className="text-[11px] text-[#855300] font-semibold truncate">
                {lang === 'te'
                  ? `స్థితి: ${student?.status === 'At Stop' ? 'స్టాప్ వద్ద ఉన్నారు' : 'పికప్ కొరకు వేచివున్నారు'}`
                  : `Status: ${student?.status || 'Awaiting Bus'}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAtStopAlert}
            className={`h-9 px-3 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0 ${
              student?.status === 'At Stop'
                ? 'bg-[#004A31] text-white'
                : 'bg-[#FEA619] text-[#684000] hover:bg-[#FEA619]/90'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{student?.status === 'At Stop' ? 'Reported' : getTranslation(lang, 'atStop')}</span>
          </button>
        </div>

        {/* Operational Primary Action CTAs */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* Call Transport Office Desk */}
          <a
            href={`tel:${store.schoolInfo.phone}`}
            className="h-12 rounded-xl bg-[#EAEDFF] text-[#00236F] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform border border-[#C5C5D3]/40"
          >
            <Headphones className="w-4 h-4 text-[#00236F]" />
            <div className="flex flex-col text-left leading-tight">
              <span>{getTranslation(lang, 'transportDesk')}</span>
              <span className="text-[9px] font-bold text-[#00236F]">{store.schoolInfo.phone}</span>
            </div>
          </a>

          {/* Report Route Delay / SOS Feedback */}
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="h-12 rounded-xl bg-[#00236F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <AlertTriangle className="w-4 h-4 text-[#FEA619]" />
            <div className="flex flex-col text-left leading-tight">
              <span>{getTranslation(lang, 'reportIssue')}</span>
              <span className="text-[9px] font-normal text-[#B6C4FF]">
                {lang === 'te' ? 'సమస్య తెలపండి' : 'Transit Feedback'}
              </span>
            </div>
          </button>
        </div>

        {/* Real Live GPS Telematics Ribbon */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E2E7FF]/70 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                bus?.status === 'MORNING_TRIP' || bus?.status === 'RETURN_TRIP'
                  ? 'bg-[#004A31] animate-pulse'
                  : 'bg-blue-600'
              }`}
            />
            <span className="font-extrabold text-[#131B2E]">
              {bus?.status === 'MORNING_TRIP' || bus?.status === 'RETURN_TRIP'
                ? lang === 'te'
                  ? 'లైవ్ ట్రిప్ నడుస్తోంది'
                  : 'Live Trip in Progress'
                : lang === 'te'
                ? 'బస్సు క్యాంపస్ వద్ద ఉంది'
                : 'Bus Parked at School'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* My Location Button */}
            <button
              type="button"
              onClick={() => handleLocateUser(true)}
              className="h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 bg-[#EAEDFF] text-[#00236F] hover:bg-[#DAE2FD] transition-colors active:scale-95"
              title={lang === 'te' ? 'నా ప్రస్తుత స్థానం' : 'My Location'}
            >
              <LocateFixed className="w-3 h-3 text-[#00236F]" />
              <span>{lang === 'te' ? 'నా స్థానం' : 'My Location'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Issue Report Modal Dialog */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFDAD6] text-[#93000A] flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#BA1A1A]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-[#131B2E]">
                    {getTranslation(lang, 'transitReportTitle')}
                  </span>
                  <span className="text-xs text-[#444651]">
                    {lang === 'te' ? 'రవాణా సమస్య నివేదిక' : 'Instant Transport Desk Alert'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#131B2E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#444651] leading-relaxed">
              {getTranslation(lang, 'selectProblem')}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportModalOpen(false);
                  showToast('Reported: Bus Stopped / Unexpected Halt to Transport Desk');
                }}
                className="h-11 rounded-xl bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] text-left px-3 text-xs font-bold flex items-center justify-between transition-colors"
              >
                <span>{getTranslation(lang, 'issueHalt')}</span>
                <span className="text-[#00236F]">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportModalOpen(false);
                  showToast('Reported: Severe Traffic Congestion to Transport Desk');
                }}
                className="h-11 rounded-xl bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] text-left px-3 text-xs font-bold flex items-center justify-between transition-colors"
              >
                <span>{getTranslation(lang, 'issueTraffic')}</span>
                <span className="text-[#00236F]">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportModalOpen(false);
                  showToast('Reported: GPS Location Glitch to Technical Team');
                }}
                className="h-11 rounded-xl bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] text-left px-3 text-xs font-bold flex items-center justify-between transition-colors"
              >
                <span>{getTranslation(lang, 'issueGps')}</span>
                <span className="text-[#00236F]">➔</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="w-full h-11 rounded-xl bg-[#EAEDFF] text-[#00236F] font-bold text-xs mt-1 transition-colors"
            >
              {getTranslation(lang, 'cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
