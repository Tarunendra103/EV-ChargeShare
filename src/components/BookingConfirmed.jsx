import React, { useMemo } from 'react';
import { useApp } from '../App.jsx';

export default function BookingConfirmed() {
  const { db, startChargingSession } = useApp();
  const booking = db.upcomingBooking;

  if (!booking) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        <h2 className="text-2xl font-bold">No active booking session found</h2>
        <a href="#/explore" className="text-primary-container underline mt-4 inline-block">Back to explore</a>
      </div>
    );
  }

  const charger = db.chargers.find(c => c.id === booking.chargerId);

  // Generate stable QR matrix grid
  const qrGridDots = useMemo(() => {
    const dots = [];
    for (let i = 0; i < 64; i++) {
      let isFilled = Math.random() > 0.45;
      const row = Math.floor(i / 8);
      const col = i % 8;
      // Keep QR code anchor corners solid
      if ((row < 3 && col < 3) || (row < 3 && col > 4) || (row > 4 && col < 3)) {
        isFilled = true;
      }
      dots.push(isFilled);
    }
    return dots;
  }, []);

  const handleStartCharging = () => {
    startChargingSession(booking.id);
    window.location.hash = '#/driver-dashboard';
  };

  const handleBackToExplore = () => {
    window.location.hash = '#/explore';
  };

  // Status-based variables
  const isPending = booking.status === 'Pending';
  const isDeclined = booking.status === 'Declined';
  const isAccepted = booking.status === 'Accepted' || booking.status === 'Confirmed';

  return (
    <main className="pt-10 pb-24 px-gutter-mobile max-w-lg mx-auto text-on-surface">
      
      {/* Success/Pending/Declined Header */}
      <section className="flex flex-col items-center text-center mb-10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-2xl animate-pulse"></div>
          
          {isPending && (
            <div className="relative w-20 h-20 bg-surface-container rounded-full flex items-center justify-center border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <span className="material-symbols-outlined text-4xl text-yellow-500 animate-pulse">hourglass_empty</span>
            </div>
          )}

          {isDeclined && (
            <div className="relative w-20 h-20 bg-surface-container rounded-full flex items-center justify-center border-2 border-error/50 shadow-[0_0_15px_rgba(255,75,75,0.2)]">
              <span className="material-symbols-outlined text-4xl text-error animate-bounce">close</span>
            </div>
          )}

          {isAccepted && (
            <div className="relative w-20 h-20 bg-surface-container rounded-full flex items-center justify-center border-2 border-primary-container success-glow">
              <svg className="w-12 h-12 text-primary-container" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewBox="0 0 24 24">
                <polyline className="animate-check" points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          )}
        </div>

        <h1 className="font-headline-lg text-headline-lg text-on-surface font-black tracking-tight mb-1.5">
          {isPending && "Booking Pending Approval"}
          {isDeclined && "Booking Declined"}
          {isAccepted && "Booking Confirmed"}
        </h1>
        <p className="text-on-surface-variant font-body-md">
          {isPending && "The host has been notified. Waiting for confirmation..."}
          {isDeclined && "The host declined your slot request. Please choose another station."}
          {isAccepted && "Your charging slot is secured. Plug in your vehicle to start."}
        </p>
      </section>

      {/* Confirmation card */}
      <div className="glass-card rounded-[1.5rem] overflow-hidden mb-8 shadow-2xl relative">
        <div className="relative h-40">
          {charger && (
            <img alt={booking.chargerName} className="w-full h-full object-cover opacity-50" src={charger.image}/>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <span className="font-label-sm text-[10px] bg-primary-container/20 text-primary-container px-2.5 py-1 rounded-md mb-2 inline-block font-bold">
                {charger ? `${charger.power} • ${charger.connector}` : ''}
              </span>
              <h2 className="font-headline-lg-mobile text-lg font-black text-white leading-tight">{booking.chargerName}</h2>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Details summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase tracking-wider">DATE</span>
              <p className="font-body-md text-on-surface font-bold text-sm">{booking.date}</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase tracking-wider">TIME SLOT</span>
              <p className="font-body-md text-on-surface font-bold text-sm">{booking.timeSlot}</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase tracking-wider">EST. COST</span>
              <p className="font-body-md text-primary-container font-bold text-sm">₹{(booking.price ?? 0).toFixed(2)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase tracking-wider">STALL NUMBER</span>
              <p className="font-body-md text-on-surface font-bold text-sm">{booking.stall}</p>
            </div>
          </div>

          {/* QR code connection scan */}
          {!isDeclined && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="qr-container p-4 rounded-2xl bg-white/[0.02]">
                  <div className="w-36 h-36 grid grid-cols-8 grid-rows-8 gap-1 opacity-90" id="qr-matrix-grid">
                    {qrGridDots.map((isFilled, idx) => (
                      <div 
                        key={idx} 
                        className={`w-full h-full rounded-sm ${isFilled ? 'bg-primary-container' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="font-label-md text-xs text-on-surface-variant tracking-widest uppercase">ID: CS-742-{booking.stall}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Action buttons */}
      <div className="space-y-4 px-2">
        {isPending && (
          <button 
            disabled
            className="w-full bg-white/5 text-on-surface-variant/40 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 cursor-not-allowed"
          >
            <span className="material-symbols-outlined animate-pulse text-sm">schedule</span>
            Waiting for Host Approval...
          </button>
        )}

        {isAccepted && (
          <button 
            onClick={handleStartCharging}
            className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] cursor-pointer"
          >
            <span className="material-symbols-outlined font-bold">bolt</span>
            Plug In & Start Charging
          </button>
        )}

        <button 
          onClick={handleBackToExplore}
          className="w-full border border-white/20 hover:bg-white/5 text-on-surface py-4 rounded-xl font-semibold active:scale-[0.98] transition-all cursor-pointer"
        >
          {isDeclined ? "Find Another Charger" : "Back to Explore"}
        </button>
      </div>
    </main>
  );
}
