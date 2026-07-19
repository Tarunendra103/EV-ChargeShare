import React, { useEffect } from 'react';
import { useApp } from '../App.jsx';

export default function DriverDashboard() {
  const { db, login, endSession, startChargingSession, clearUpcomingBooking } = useApp();
  const user = db.currentUser;
  const history = db.driverHistory;
  const activeSession = db.activeSession;
  const upcomingBooking = db.upcomingBooking;

  // Role guard: if owner, switch to driver
  useEffect(() => {
    if (user.role === 'owner') {
      login(user.email, 'driver');
    }
  }, [user.role, user.email, login]);

  // Aggregate stats
  const sessionCount = history.length;
  const energySum = history.reduce((sum, h) => sum + parseFloat(h.energy || 0), 0).toFixed(1);
  const spentSum = history.reduce((sum, h) => sum + (h.price || 0), 0).toFixed(2);

  return (
    <main className="pt-6 pb-24 px-gutter-mobile lg:px-12 max-w-7xl mx-auto min-h-screen text-on-surface">
      
      {/* Dynamic Upcoming Booking status card */}
      {upcomingBooking && (
        <section className="mb-8">
          <h3 className="font-headline-lg text-headline-lg-mobile md:text-xl font-black text-on-surface mb-4 flex items-center gap-3">
            Active Booking Reservation
            <span className={`inline-block w-2 h-2 rounded-full ${
              upcomingBooking.status === 'Pending' 
                ? 'bg-yellow-500 animate-pulse' 
                : upcomingBooking.status === 'Declined' 
                  ? 'bg-error' 
                  : 'bg-primary-container'
            }`}></span>
          </h3>

          <div className={`glass-card p-6 rounded-3xl border ${
            upcomingBooking.status === 'Pending' 
              ? 'border-yellow-500/20 bg-yellow-500/[0.02]' 
              : upcomingBooking.status === 'Declined' 
                ? 'border-error/20 bg-error/[0.02]' 
                : 'border-primary-container/20'
          } flex flex-col md:flex-row justify-between items-center gap-6`}>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                upcomingBooking.status === 'Pending' 
                  ? 'bg-yellow-500/10 text-yellow-500' 
                  : upcomingBooking.status === 'Declined' 
                    ? 'bg-error/10 text-error' 
                    : 'bg-primary-container/10 text-primary-container'
              }`}>
                <span className="material-symbols-outlined text-3xl">
                  {upcomingBooking.status === 'Pending' 
                    ? 'hourglass_empty' 
                    : upcomingBooking.status === 'Declined' 
                      ? 'close' 
                      : 'check_circle'
                  }
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-black text-on-surface text-lg leading-tight">{upcomingBooking.chargerName}</h4>
                <p className="text-on-surface-variant text-sm mt-1">
                  Slot: <strong>{upcomingBooking.date} • {upcomingBooking.timeSlot}</strong>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {upcomingBooking.status === 'Pending' && (
                    <span className="px-2.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-label-sm text-[10px] font-bold uppercase tracking-wider">
                      Waiting for Host
                    </span>
                  )}
                  {upcomingBooking.status === 'Declined' && (
                    <span className="px-2.5 py-0.5 rounded bg-error/10 text-error font-label-sm text-[10px] font-bold uppercase tracking-wider">
                      Declined by Host
                    </span>
                  )}
                  {(upcomingBooking.status === 'Accepted' || upcomingBooking.status === 'Confirmed') && (
                    <span className="px-2.5 py-0.5 rounded bg-primary-container/10 text-primary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                      Approved
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded bg-white/5 text-on-surface-variant font-label-sm text-[10px] uppercase">
                    Stall {upcomingBooking.stall}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto shrink-0 justify-end">
              {(upcomingBooking.status === 'Accepted' || upcomingBooking.status === 'Confirmed') && (
                <button 
                  onClick={() => startChargingSession(upcomingBooking.id)}
                  className="flex-grow md:flex-none bg-primary-container text-on-primary-container font-bold px-6 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,135,0.2)] text-xs uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-sm font-bold">bolt</span>
                  Plug In & Charge
                </button>
              )}
              {upcomingBooking.status === 'Declined' ? (
                <button 
                  onClick={clearUpcomingBooking}
                  className="flex-grow md:flex-none bg-error-container/20 text-error hover:bg-error-container/30 font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  Clear Reservation
                </button>
              ) : (
                <button 
                  onClick={() => window.location.hash = '#/confirmed'}
                  className="flex-grow md:flex-none bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  View Details
                </button>
              )}
            </div>

          </div>
        </section>
      )}

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary-container/30">
          <div>
            <p className="text-on-surface-variant font-label-sm text-xs mb-1 uppercase tracking-wider">Total Sessions</p>
            <p className="font-headline-lg text-2xl font-black text-primary tracking-tight">{sessionCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary-container font-bold">bolt</span>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary-container/30">
          <div>
            <p className="text-on-surface-variant font-label-sm text-xs mb-1 uppercase tracking-wider">Energy Consumed</p>
            <p className="font-headline-lg text-2xl font-black text-primary tracking-tight">
              {energySum} <span className="text-sm font-normal opacity-50">kWh</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary-container font-bold">ev_station</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary-container/30">
          <div>
            <p className="text-on-surface-variant font-label-sm text-xs mb-1 uppercase tracking-wider">Total Spent</p>
            <p className="font-headline-lg text-2xl font-black text-primary tracking-tight">₹{spentSum}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary-container font-bold">payments</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: Charging Status Banner */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-xl font-black text-on-surface flex items-center gap-3">
            Charging Status
          </h2>

          <div id="active-session-card-container">
            {activeSession ? (
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden border border-primary-container/20">
                <div className="absolute inset-0 shimmer opacity-5 pointer-events-none"></div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container text-3xl animate-pulse">ev_station</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline-lg-mobile text-lg font-black text-primary leading-tight">Charging Live</h3>
                    <p className="text-on-surface-variant text-sm mt-1">
                      Your vehicle is currently plugged into <strong>{activeSession.chargerName}</strong>. The host is tracking and monitoring the session progress.
                    </p>
                  </div>
                  <div>
                    <button 
                      onClick={endSession}
                      className="bg-error text-white px-5 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">stop_circle</span>
                      Stop Charging
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 text-center text-on-surface-variant">
                <div className="w-16 h-16 bg-white/3 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <span className="material-symbols-outlined text-4xl opacity-50">ev_station</span>
                </div>
                <h3 className="text-lg font-bold mb-1">No active charging session</h3>
                <p className="text-sm max-w-sm mx-auto mb-6">Find and book an available charger slot to charge your vehicle.</p>
                <button 
                  onClick={() => window.location.hash = '#/explore'}
                  className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(0,255,135,0.3)] transition-all cursor-pointer"
                >
                  Explore Chargers
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Session charging history list */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-xl font-black text-on-surface">Charging History</h2>
            <span className="text-on-surface-variant text-xs opacity-60">{sessionCount} records</span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {history.map(hist => (
              <div key={hist.id} className="glass-card p-4 rounded-xl group cursor-pointer hover:bg-white/5 border border-transparent transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined">ev_station</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary-container transition-colors truncate max-w-[130px]">{hist.chargerName}</h4>
                      <p className="text-on-surface-variant text-[11px] font-label-sm">{hist.date}</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary-container font-label-md">₹{(hist.price ?? 0).toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider pt-1 border-t border-white/5">
                  <span>{hist.energy}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-on-surface-variant/40"></span> 
                    {hist.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
