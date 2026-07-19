import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App.jsx';

export default function AddCharger() {
  const { addCharger } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [chgName, setChgName] = useState("Premium P2P Charger");
  const [chgAddress, setChgAddress] = useState("");
  const [chgCity, setChgCity] = useState("");
  const [chgZip, setChgZip] = useState("");
  const [chgConnector, setChgConnector] = useState("CCS2");
  const [chgPower, setChgPower] = useState("50 kW");
  const [chgHours, setChgHours] = useState("24/7 Access");
  const [chgRestrictions, setChgRestrictions] = useState("None");
  const [chgPrice, setChgPrice] = useState(18);

  const [selectedCoords, setSelectedCoords] = useState({ lat: 12.9716, lng: 77.5946 }); // Bengaluru default
  const [gpsLoading, setGpsLoading] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initial map setup in Step 1
  useEffect(() => {
    if (currentStep !== 1) return;

    const container = document.getElementById('add-charger-map-canvas');
    if (!container || mapRef.current) return;

    const map = window.L.map('add-charger-map-canvas', { 
      attributionControl: false 
    }).setView([selectedCoords.lat, selectedCoords.lng], 14);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    const marker = window.L.marker([selectedCoords.lat, selectedCoords.lng], {
      draggable: true,
      icon: window.L.divIcon({
        html: `<div class="custom-leaflet-marker marker-available"><div class="marker-core core-available"></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }).addTo(map);

    // Event on map click
    map.on('click', (e) => {
      updatePosition(e.latlng.lat, e.latlng.lng, marker, map);
    });

    // Event on marker drag
    marker.on('dragend', (e) => {
      const latlng = marker.getLatLng();
      updatePosition(latlng.lat, latlng.lng, marker, map);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Run initial reverse geocoding if inputs are empty
    if (!chgAddress) {
      updatePosition(selectedCoords.lat, selectedCoords.lng, marker, map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [currentStep]);

  // Update position and reverse geocode address
  const updatePosition = (lat, lng, marker, map) => {
    setSelectedCoords({ lat, lng });
    const targetMarker = marker || markerRef.current;
    if (targetMarker) {
      targetMarker.setLatLng([lat, lng]);
    }

    // Nominatim reverse geocoding API
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'Accept-Language': 'en' }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.pedestrian || addr.suburb || '';
          const houseNumber = addr.house_number || '';
          const street = houseNumber ? `${houseNumber} ${road}` : road;
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const zip = addr.postcode || '';

          if (street) setChgAddress(street);
          if (city) setChgCity(city);
          if (zip) setChgZip(zip);
        }
      })
      .catch(err => console.error("Reverse geocoding failed:", err));
  };

  // Geolocation detector
  const handleGPSDetect = () => {
    setGpsLoading(true);

    const onLocationDetected = (lat, lng) => {
      setSelectedCoords({ lat, lng });
      const map = mapRef.current;
      const marker = markerRef.current;
      if (map && marker) {
        map.setView([lat, lng], 15);
        updatePosition(lat, lng, marker, map);
      }
      setGpsLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationDetected(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("HTML5 GPS failed, falling back to IP:", err);
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(ipData => {
            if (ipData.latitude && ipData.longitude) {
              onLocationDetected(ipData.latitude, ipData.longitude);
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!chgName.trim()) {
        alert("Please enter a Station Name.");
        return;
      }
      if (!chgAddress.trim() || !chgCity.trim() || !chgZip.trim()) {
        alert("Please fill in Street Address, City, and Zip Code.");
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!chgName.trim() || !chgAddress.trim() || !chgCity.trim() || !chgZip.trim()) {
      alert("Please fill in all location details before submitting.");
      setCurrentStep(1);
      return;
    }
    setSubmitting(true);

    const chargerPhoto = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbI7y8FDXz_bIayy_HmxzmYBFy22hE4046i2xGZaMlvaJZVMWAL65gW2eMxsbG5WQbGdZPuiRg7U8Es2RJDYkwDo88X0j6ati2vpm77z4gwiDA3O7DRQM6SqB5uW3BGFQOfmoNuSl1kw_tcR7r7ymXqmfjAF1xXjDN_KpnZkAMe6kgIBFy1JJH35G81gWwZw5DnuNp4bjsDFc6vU70NMHa8fOyR0GvK4N_tJhoLQ8sSAhgtPHFTjc8TepRpWXCHrnd80GSqYs6xlkh';

    setTimeout(() => {
      addCharger({
        name: chgName,
        location: `${chgAddress}, ${chgCity} ${chgZip}`,
        status: 'Available',
        price: parseFloat(chgPrice),
        power: chgPower,
        connector: chgConnector,
        distance: '0.1 km',
        coords: selectedCoords,
        image: chargerPhoto,
        hours: chgHours,
        restrictions: chgRestrictions,
        amenities: 'Restroom, Wi-Fi, Coffee'
      });

      setSubmitting(false);
      window.location.hash = '#/owner-dashboard';
    }, 1000);
  };

  // Pricing calculator values
  const fee = chgPrice * 0.05;
  const net = chgPrice - fee;

  return (
    <main className="px-gutter-mobile py-24 lg:py-12 lg:px-12 max-w-4xl mx-auto min-h-screen text-on-surface">
      
      {/* Wizard Header Progress Bar */}
      <section className="mb-10 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="font-label-sm text-[10px] text-primary-container uppercase tracking-widest block">Wizard Listing Stepper</span>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">List Your Charger</h2>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold" id="step-indicator">
            Step {currentStep} of 3
          </span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div 
            className="h-full bg-primary-container transition-all duration-500 ease-out" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Stepper Nodes */}
        <div className="flex justify-between items-center max-w-md mx-auto pt-6">
          {[1, 2, 3].map(num => (
            <div key={num} className="flex items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  num <= currentStep 
                    ? 'bg-primary-container text-on-primary-container' 
                    : 'bg-surface-variant text-on-surface-variant'
                }`}
              >
                {num}
              </div>
              <span className={`text-xs font-bold transition-all ${num <= currentStep ? 'text-primary' : 'text-on-surface-variant'}`}>
                {num === 1 ? 'Location' : num === 2 ? 'Specs' : 'Pricing'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Form container */}
      <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="space-y-8">
          
          {/* STEP 1: Location & Coordinates selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Station Name</label>
                <input 
                  required 
                  type="text" 
                  value={chgName} 
                  onChange={(e) => setChgName(e.target.value)}
                  className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md"
                />
              </div>

              {/* Map Canvas for coordinate geolocator */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Pin Location on Map</label>
                  <button 
                    type="button" 
                    onClick={handleGPSDetect} 
                    disabled={gpsLoading}
                    className="bg-white/5 hover:bg-white/10 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1 text-primary-container cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-sm ${gpsLoading ? 'animate-spin' : ''}`}>my_location</span>
                    {gpsLoading ? 'Detecting...' : 'Detect Device Location'}
                  </button>
                </div>
                <div 
                  id="add-charger-map-canvas" 
                  className="w-full h-64 bg-surface-container rounded-2xl border border-white/10 z-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Street Address</label>
                  <input 
                    required 
                    type="text" 
                    value={chgAddress} 
                    onChange={(e) => setChgAddress(e.target.value)}
                    className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">City</label>
                  <input 
                    required 
                    type="text" 
                    value={chgCity} 
                    onChange={(e) => setChgCity(e.target.value)}
                    className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Zip Code</label>
                  <input 
                    required 
                    type="text" 
                    value={chgZip} 
                    onChange={(e) => setChgZip(e.target.value)}
                    className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Configuration / Specifications */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Connector Type</label>
                  <select 
                    value={chgConnector} 
                    onChange={(e) => setChgConnector(e.target.value)}
                    className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md bg-surface-container-high"
                  >
                    <option value="CCS2">CCS2 (Type 2 Combined)</option>
                    <option value="Type 2">Type 2 AC (Mennekes)</option>
                    <option value="Tesla Supercharger">Tesla Supercharger</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Charging Power</label>
                  <select 
                    value={chgPower} 
                    onChange={(e) => setChgPower(e.target.value)}
                    className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md bg-surface-container-high"
                  >
                    <option value="22 kW">22 kW (Mennekes Fast AC)</option>
                    <option value="50 kW">50 kW (DC Fast Charger)</option>
                    <option value="150 kW">150 kW (Ultra-Fast DC)</option>
                    <option value="350 kW">350 kW (Hyper-Fast DC)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Availability Hours</label>
                  <select 
                    value={chgHours} 
                    onChange={(e) => setChgHours(e.target.value)}
                    className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md bg-surface-container-high"
                  >
                    <option value="24/7 Access">24/7 Unlimited Access</option>
                    <option value="Business Hours (09:00 AM - 06:00 PM)">Business Hours (9 AM - 6 PM)</option>
                    <option value="Weekends Only">Weekends Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Access Restrictions</label>
                  <select 
                    value={chgRestrictions} 
                    onChange={(e) => setChgRestrictions(e.target.value)}
                    className="glass-input w-full px-4 py-3.5 rounded-xl text-on-surface font-body-md bg-surface-container-high"
                  >
                    <option value="None">None (Open to public)</option>
                    <option value="Gated Society (requires guard approval)">Gated Society</option>
                    <option value="Registered EV drivers only">Registered Members Only</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Pricing & Review settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border-glow-green space-y-6">
                
                {/* Cost Input and Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Base Rate Pricing (₹/kWh)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-primary-container font-black text-lg">₹</span>
                      <input 
                        type="number"
                        min="5"
                        max="150"
                        value={chgPrice}
                        onChange={(e) => setChgPrice(parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-primary-container font-black text-right glass-input font-headline-lg-mobile text-lg"
                      />
                    </div>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="100"
                    value={chgPrice > 100 ? 100 : chgPrice}
                    onChange={(e) => setChgPrice(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                </div>

                {/* Pricing layout breakdown calculations */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div>
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider block">5% Transaction Fee</span>
                    <p className="font-body-md text-on-surface font-semibold mt-0.5" id="calc-fee">-₹{fee.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider block">Estimated Net Income</span>
                    <p className="font-body-md text-primary-container font-bold mt-0.5" id="calc-net">₹{net.toFixed(2)}/kWh</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Stepper Wizard Action Buttons */}
          <div className="flex justify-between items-center border-t border-white/5 pt-6">
            <button 
              type="button" 
              onClick={handlePrevStep}
              className={`px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 font-semibold transition-all ${
                currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
              }`}
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button 
                type="button" 
                onClick={handleNextStep}
                className="bg-primary-container text-on-primary-container font-bold px-8 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all"
              >
                Continue
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary-container text-on-primary-container font-bold px-8 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(0,255,135,0.2)]"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    <span>Saving Listing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Publish</span>
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

    </main>
  );
}
