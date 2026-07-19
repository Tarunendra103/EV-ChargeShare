import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App.jsx';

export default function ChargerDetails({ chargerId }) {
  const { db, createBooking } = useApp();
  const charger = db.chargers.find(c => c.id === chargerId);

  if (!charger) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        <h2 className="text-2xl font-bold">Charger details not found</h2>
        <a href="#/explore" className="text-primary-container underline mt-4 inline-block">Back to explore</a>
      </div>
    );
  }

  const chargerReviews = db.reviews.filter(r => r.chargerId === charger.id);
  const displayedReviews = chargerReviews.slice(0, 2);

  // Date and Time picker states
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [customTime, setCustomTime] = useState('10:30');

  const format24to12 = (time24) => {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':').map(Number);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMins = minutes.toString().padStart(2, '0');
    return `${hours.toString().padStart(2, '0')}:${strMins} ${modifier}`;
  };

  const handleCustomTimeChange = (val) => {
    setCustomTime(val);
    const formatted = format24to12(val);
    setSelectedTime(formatted);
  };

  // Slider states
  const [currentBattery, setCurrentBattery] = useState(24);
  const [targetBattery, setTargetBattery] = useState(85);

  const mapRef = useRef(null);

  // Map initialization
  useEffect(() => {
    const canvas = document.getElementById('details-map-canvas');
    if (!canvas || mapRef.current) return;

    const map = window.L.map('details-map-canvas', { 
      zoomControl: false, 
      attributionControl: false 
    }).setView([charger.coords.lat, charger.coords.lng], 15);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    
    window.L.marker([charger.coords.lat, charger.coords.lng], {
      icon: window.L.divIcon({ 
        html: `<div class="custom-leaflet-marker marker-${charger.status.toLowerCase()}"><div class="marker-core core-${charger.status.toLowerCase()}"></div></div>`, 
        iconSize: [30, 30], 
        iconAnchor: [15, 15] 
      })
    }).addTo(map).bindPopup(`<div class="p-1 font-bold text-xs">${charger.name}</div>`);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [charger]);

  // Adjust sliders so target >= current
  const handleCurrentChange = (e) => {
    const val = parseInt(e.target.value);
    setCurrentBattery(val);
    if (targetBattery < val) {
      setTargetBattery(val);
    }
  };

  const handleTargetChange = (e) => {
    const val = parseInt(e.target.value);
    if (val >= currentBattery) {
      setTargetBattery(val);
    }
  };

  // Live calculations formulas matching main.js
  const diffPercent = targetBattery - currentBattery;
  const kWhDelivered = diffPercent * 0.7;
  const estCost = kWhDelivered * charger.price;

  const powerKw = parseFloat(charger.power) || 22;
  const chargeTimeHours = kWhDelivered / (powerKw * 0.9); // 90% efficiency
  const hours = Math.floor(chargeTimeHours);
  const mins = Math.round((chargeTimeHours - hours) * 60);

  let timeString = '0m';
  if (diffPercent > 0) {
    if (hours === 0) {
      timeString = `${mins}m`;
    } else {
      timeString = `${hours}h ${mins}m`;
    }
  }

  const handleBookSlot = () => {
    createBooking(charger.id, selectedDate, selectedTime, currentBattery, targetBattery, estCost);
    window.location.hash = '#/booking-confirmed';
  };

  // Generate date labels
  const todayDate = new Date();
  const tomorrowDate = new Date(Date.now() + 86400000);
  const dayAfterDate = new Date(Date.now() + 172800000);
  const dayAfter2Date = new Date(Date.now() + 259200000);

  const getDayLabel = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  const isSlotBooked = (time) => {
    const datePrefix = selectedDate === 'Today' ? 'Today' : selectedDate === 'Tomorrow' ? 'Tomorrow' : selectedDate;
    return db.ownerBookings.some(
      b => b.chargerId === chargerId && 
           b.timeText.includes(datePrefix) &&
           b.timeText.includes(time) &&
           b.status !== 'Cancelled'
    );
  };

  const isSlotInPast = (timeStr) => {
    if (selectedDate !== 'Today') return false; // Past check only applies to today!
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    // Parse timeStr like "09:00 AM" or "02:30 PM"
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    // Compare
    if (currentHour > hours) return true;
    if (currentHour === hours && currentMin > minutes) return true;
    return false;
  };

  const isTimeDisabled = (time) => {
    return isSlotBooked(time) || isSlotInPast(time);
  };

  return (
    <main className="pt-4 pb-24 lg:pb-0 min-h-screen text-on-surface">
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* Left Column: Map & Primary Info */}
        <section className="w-full lg:w-3/5 relative flex flex-col">
          
          {/* Map View Area */}
          <div className="h-[300px] lg:h-[400px] w-full map-container relative overflow-hidden bg-surface-container-lowest border-b border-white/5">
            <div id="details-map-canvas" className="w-full h-full z-10"></div>

            {/* Navigation directions overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-[1000]">
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(charger.location)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold text-on-surface hover:text-primary-container transition-colors pointer-events-auto"
              >
                <span className="material-symbols-outlined text-primary-container text-sm">navigation</span>
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Description and Host Cards */}
          <div className="px-gutter-mobile lg:px-12 py-8 flex flex-col gap-8">
            
            {/* Header pricing and power badge */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-primary-container/10 text-primary-container px-2.5 py-0.5 rounded font-label-sm text-xs font-bold tracking-wider">{charger.power}</span>
                  <span className="bg-white/5 text-on-surface-variant px-2.5 py-0.5 rounded font-label-sm text-xs uppercase">{charger.connector}</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{charger.name}</h2>
                <p className="text-on-surface-variant font-body-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">location_on</span> {charger.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary-container font-headline-lg text-headline-lg font-bold">₹{(charger.price ?? 0).toFixed(2)}</p>
                <p className="text-on-surface-variant font-label-sm text-label-sm">per kWh</p>
              </div>
            </div>

            {/* Host Bio Card */}
            <div className="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-primary-container/30 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <img 
                  className="w-12 h-12 rounded-full border border-white/20 object-cover" 
                  src={charger.ownedByUser ? db.currentUser.avatar : charger.hostAvatar} 
                  alt={charger.ownedByUser ? db.currentUser.name : charger.host}
                />
                <div>
                  <p className="text-on-surface font-bold">Hosted by {charger.ownedByUser ? db.currentUser.name : charger.host}</p>
                  <div className="flex items-center gap-1 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-yellow-500 text-sm material-symbols-fill">star</span>
                    <span className="font-label-sm">{(charger.reviewsCount ?? 0) > 0 ? (charger.rating ?? 0).toFixed(1) : 'N/A'} ({charger.reviewsCount ?? 0} reviews)</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container transition-colors" onClick={() => window.location.hash = '#/reviews'}>chevron_right</span>
            </div>

            {/* Amenities Section */}
            <div className="space-y-3">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">Station Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {charger.amenities ? (
                  charger.amenities.split(',').map((amenity, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span>
                      {amenity.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-on-surface-variant text-xs italic">No specific amenities listed.</span>
                )}
              </div>
            </div>

            {/* Reviews list Outline */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">Recent Reviews</h3>
                <a href="#/reviews" className="text-primary-container font-label-sm text-xs hover:underline">All {charger.reviewsCount} reviews</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedReviews.length === 0 ? (
                  <p className="text-on-surface-variant text-xs italic">No reviews yet. Be the first to leave feedback!</p>
                ) : (
                  displayedReviews.map(rev => (
                    <div key={rev.id} className="glass-card p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img className="w-7 h-7 rounded-full object-cover" src={rev.avatar} alt={rev.userName}/>
                          <span className="font-label-md text-xs text-on-surface">{rev.userName}</span>
                        </div>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx} className={`material-symbols-outlined text-xs ${idx < rev.rating ? 'material-symbols-fill' : ''}`}>star</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-xs italic leading-relaxed">"{rev.text}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Timepicker & Estimator Calculator */}
        <aside className="w-full lg:w-2/5 px-gutter-mobile lg:px-8 py-8 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto border-l border-white/5 bg-surface-container-low/30 backdrop-blur-md">
          <div className="space-y-8">
            
            {/* Date Picker Carousel */}
            <div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold mb-4">Book Your Slot</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" id="date-slot-picker">
                {[
                  { label: 'TODAY', value: 'Today', date: todayDate.getDate() },
                  { label: 'TOMORROW', value: 'Tomorrow', date: tomorrowDate.getDate() },
                  { label: getDayLabel(dayAfterDate), value: 'Day-After', date: dayAfterDate.getDate() },
                  { label: getDayLabel(dayAfter2Date), value: 'Day-After-2', date: dayAfter2Date.getDate() }
                ].map((item) => (
                  <button 
                    key={item.value}
                    onClick={() => setSelectedDate(item.value)}
                    className={`date-chip min-w-[70px] flex flex-col items-center py-3 rounded-xl border transition-all ${
                      selectedDate === item.value 
                        ? 'border-primary-container bg-primary-container/10 text-primary-container' 
                        : 'border-white/5 bg-white/3 opacity-60 text-on-surface-variant hover:opacity-100'
                    }`}
                  >
                    <span className="font-label-sm text-[10px] font-bold">{item.label}</span>
                    <span className={`font-headline-lg-mobile text-lg ${selectedDate === item.value ? 'font-black' : ''}`}>{item.date}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Picker Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Select Time Slot</p>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-primary-container/50 transition-colors">
                  <span className="material-symbols-outlined text-xs text-primary-container">schedule</span>
                  <input 
                    type="time"
                    value={customTime}
                    onChange={(e) => handleCustomTimeChange(e.target.value)}
                    className="bg-transparent text-xs text-on-surface font-bold outline-none cursor-pointer border-none p-0 w-16"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2" id="time-slot-picker">
                {[
                  '09:00 AM',
                  '10:30 AM',
                  '12:00 PM',
                  '02:30 PM',
                  '04:00 PM',
                  '06:00 PM'
                ].map((time) => {
                  const disabled = isTimeDisabled(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button 
                      key={time}
                      disabled={disabled}
                      type="button"
                      onClick={() => {
                        setSelectedTime(time);
                        const [t, modifier] = time.split(' ');
                        let [h, m] = t.split(':').map(Number);
                        if (modifier === 'PM' && h < 12) h += 12;
                        if (modifier === 'AM' && h === 12) h = 0;
                        setCustomTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                      }}
                      className={`time-chip glass-card py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        disabled 
                          ? 'opacity-30 cursor-not-allowed line-through' 
                          : isSelected 
                            ? 'bg-primary-container/20 border-primary-container text-primary-container border' 
                            : 'hover:bg-white/10'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic confirmation badge for custom slots */}
              {!['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '06:00 PM'].includes(selectedTime) && (
                <div className="flex justify-center mt-2 animate-pulse">
                  <div className="bg-primary-container/10 border border-primary-container/20 text-primary-container px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    <span>Selected: {selectedTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Estimator */}
            <div className="glass-card p-5 rounded-2xl space-y-5 border-glow-green">
              <div className="flex justify-between items-center">
                <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">Cost Estimator</h4>
                <span className="material-symbols-outlined text-primary-container text-xl">calculate</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Current Battery</span>
                    <span className="font-label-md text-primary-container font-bold">{currentBattery}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={currentBattery}
                    onChange={handleCurrentChange}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Target Battery</span>
                    <span className="font-label-md text-primary-container font-bold">{targetBattery}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={targetBattery}
                    onChange={handleTargetChange}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                </div>
              </div>

              {/* Progress bar overlay */}
              <div className="relative w-full h-11 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-container/30 to-primary-container transition-all duration-300" 
                  style={{ width: `${diffPercent}%` }}
                >
                  <div className="w-full h-full opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[scan_2s_linear_infinite]"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-label-sm text-label-sm text-white font-bold tracking-wide">
                    +{diffPercent}% Charge Needed
                  </span>
                </div>
              </div>

              {/* Pricing breakdown summary */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-on-surface-variant font-label-sm text-[10px] tracking-wider uppercase">ESTIMATED TOTAL</p>
                  <p className="text-primary-container font-headline-lg text-headline-lg font-bold">₹{estCost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-on-surface-variant font-label-sm text-[10px] tracking-wider uppercase">ESTIMATED TIME</p>
                  <p className="text-on-surface font-body-lg font-semibold">{timeString}</p>
                </div>
              </div>
            </div>

            {/* Booking action submit CTA */}
            <button 
              onClick={handleBookSlot}
              className="w-full bg-primary-container text-on-primary-container py-4.5 rounded-2xl font-headline-lg-mobile text-headline-lg-mobile font-bold uppercase tracking-wide primary-glow active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Book This Slot <span className="material-symbols-outlined font-bold text-xl">bolt</span>
            </button>
            <p className="text-center text-on-surface-variant font-label-sm text-xs opacity-60">Cancellation free up to 2 hours before start.</p>
          </div>
        </aside>

      </div>
    </main>
  );
}
