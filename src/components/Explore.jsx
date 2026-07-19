import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App.jsx';

export default function Explore() {
  const { db } = useApp();
  const chargers = db.chargers;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeConnector, setActiveConnector] = useState('All');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const mapRef = useRef(null);
  const markerGroupRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Filter chargers
  const filteredChargers = chargers.filter(charger => {
    const matchSearch = 
      charger.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      charger.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchConnector = 
      activeConnector === 'All' || 
      charger.connector.toUpperCase() === activeConnector.toUpperCase() ||
      (activeConnector === 'Tesla' && charger.connector === 'Tesla Supercharger');
    
    return matchSearch && matchConnector;
  });

  // Initialize Map
  useEffect(() => {
    if (mapRef.current) return;

    const map = window.L.map('map-canvas', {
      zoomControl: false,
      attributionControl: true
    }).setView([12.9716, 77.5946], 13);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    // Auto-locate user on mount
    setGpsLoading(true);
    const onLocationFound = (lat, lng) => {
      setUserCoords({ lat, lng });
      map.setView([lat, lng], 13);

      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      const pulseMarker = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
          html: `<div class="custom-leaflet-marker marker-gps"><div class="marker-core core-gps animate-pulse"></div></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      });

      pulseMarker.addTo(map).bindPopup('<div class="p-1 font-bold text-xs text-primary-container">Your Current Location</div>');
      userMarkerRef.current = pulseMarker;
      setGpsLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationFound(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("GPS failed, trying IP lookup:", err);
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(ipData => {
            if (ipData.latitude && ipData.longitude) {
              onLocationFound(ipData.latitude, ipData.longitude);
            } else {
              setGpsLoading(false);
            }
          })
          .catch(() => {
            setGpsLoading(false);
          });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Chargers Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markerGroupRef.current.forEach(m => map.removeLayer(m));
    markerGroupRef.current = [];

    const newMarkers = [];
    filteredChargers.forEach(charger => {
      const isAvailable = charger.status === 'Available';
      const marker = window.L.marker([charger.coords.lat, charger.coords.lng], {
        icon: window.L.divIcon({
          html: `<div class="custom-leaflet-marker marker-${charger.status.toLowerCase()}"><div class="marker-core core-${charger.status.toLowerCase()}"></div></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      });

      marker.addTo(map);
      marker.bindPopup(`<div class="p-1 font-bold text-xs">${charger.name}</div>`);
      
      newMarkers.push(marker);
    });

    markerGroupRef.current = newMarkers;
  }, [filteredChargers]);

  // Handle GPS location search fallback
  const handleGPSDetect = () => {
    const map = mapRef.current;
    if (!map) return;

    setGpsLoading(true);

    const onLocationFound = (lat, lng) => {
      setUserCoords({ lat, lng });
      map.setView([lat, lng], 13);

      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      const pulseMarker = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
          html: `<div class="custom-leaflet-marker marker-gps"><div class="marker-core core-gps animate-pulse"></div></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      });

      pulseMarker.addTo(map).bindPopup('<div class="p-1 font-bold text-xs text-primary-container">Your Current Location</div>');
      userMarkerRef.current = pulseMarker;
      setGpsLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationFound(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("GPS failed, trying IP lookup:", err);
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(ipData => {
            if (ipData.latitude && ipData.longitude) {
              onLocationFound(ipData.latitude, ipData.longitude);
            } else {
              setGpsLoading(false);
            }
          })
          .catch(() => {
            setGpsLoading(false);
          });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleCardClick = (charger) => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([charger.coords.lat, charger.coords.lng], 15);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] lg:h-screen w-full overflow-hidden relative">
      
      {/* Left Sidebar List panel */}
      <section className="w-full lg:w-[420px] bg-surface-container-low/75 backdrop-blur-3xl border-r border-white/5 flex flex-col h-1/2 lg:h-full z-10">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg font-bold text-primary">Explore Chargers</h1>
            <button 
              onClick={handleGPSDetect}
              disabled={gpsLoading}
              className="bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1 text-primary-container"
            >
              <span className={`material-symbols-outlined text-sm ${gpsLoading ? 'animate-spin' : ''}`}>my_location</span>
              {gpsLoading ? 'Detecting...' : 'Near Me'}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search station name or area..." 
              className="glass-input w-full pl-12 pr-4 py-3 rounded-xl font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30"
            />
          </div>

          {/* Connectors filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'CCS2', 'Type 2', 'Tesla'].map(connector => (
              <button 
                key={connector}
                onClick={() => setActiveConnector(connector)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  activeConnector === connector 
                    ? 'bg-primary-container text-on-primary-container border-primary-container font-black' 
                    : 'bg-white/5 border-white/10 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {connector}
              </button>
            ))}
          </div>
        </div>

        {/* Listings scroll box */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {filteredChargers.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-on-surface-variant/50">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p className="font-body-md text-sm">No chargers match your search criteria.</p>
            </div>
          ) : (
            filteredChargers.map(charger => {
              const isAvailable = charger.status === 'Available';
              return (
                <div 
                  key={charger.id}
                  id={`charger-card-${charger.id}`}
                  onClick={() => handleCardClick(charger)}
                  className="glass-card rounded-2xl p-4 cursor-pointer group hover:bg-white/[0.05] border-2 border-transparent transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-variant border border-white/10">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        src={charger.image} 
                        alt={charger.name}
                      />
                    </div>
                    <span className={`${
                      isAvailable ? 'bg-primary-container/10 text-primary-container' : 'bg-white/10 text-on-surface-variant'
                    } px-3 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 ${isAvailable ? 'bg-primary-container animate-pulse' : 'bg-on-surface-variant/40'} rounded-full`}></span>
                      {charger.status}
                    </span>
                  </div>
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-0.5 group-hover:text-primary-container transition-colors font-bold">
                    {charger.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-2 truncate">{charger.location}</p>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        {charger.power}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        ₹{charger.price}/kWh
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.hash = `#/charger-details/${charger.id}`;
                      }}
                      className="bg-primary-container text-on-primary-container hover:scale-[1.05] text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,135,0.15)]"
                    >
                      <span>Book Slot</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Right Map Canvas Panel */}
      <section className="flex-1 h-1/2 lg:h-full relative w-full">
        <div id="map-canvas" className="w-full h-full z-0"></div>
      </section>

    </div>
  );
}
