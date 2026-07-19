import React, { useState } from 'react';
import { useApp } from '../App.jsx';

export default function Profile() {
  const { db, updateProfile } = useApp();
  const user = db.currentUser;

  // Local state for inputs
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [vehicle, setVehicle] = useState(user.vehicle || '');
  
  // Feedback states
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateProfile(name, phone, vehicle);
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset the database and clear all cached mock data? This will clear all listings and history, and reset your wallet to ₹5000.00.")) {
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          localStorage.removeItem('chargeshare_db');
          alert("Database and cache reset successfully!");
          window.location.hash = '#/explore';
          window.location.reload();
        } else {
          alert("Failed to reset database on backend.");
        }
      } catch (e) {
        console.error(e);
        localStorage.removeItem('chargeshare_db');
        window.location.reload();
      }
    }
  };

  const handleClearProfile = () => {
    if (window.confirm("Are you sure you want to clear your saved profile details (name, phone, vehicle)?")) {
      setName('');
      setPhone('');
      setVehicle('');
      updateProfile('', '', '');
      alert("Saved profile details deleted!");
    }
  };

  return (
    <main className="px-gutter-mobile py-24 lg:py-12 lg:px-12 max-w-2xl mx-auto space-y-10 min-h-screen text-on-surface">
      
      {/* Header */}
      <header className="flex flex-col gap-2">
        <p className="font-label-md text-label-md text-primary-container uppercase tracking-widest">Account Details</p>
        <h2 className="font-display-lg text-display-lg text-primary leading-tight">My Profile</h2>
      </header>

      {/* Profile Card & Form */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden border border-white/10">
        <div className="absolute inset-0 shimmer opacity-5 pointer-events-none"></div>

        {/* User Badge Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
          <div className="relative">
            <img 
              className="w-24 h-24 rounded-full border-2 border-primary-container object-cover" 
              src={user.avatar} 
              alt={user.name}
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-container border-2 border-surface-dim flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] text-on-primary-container font-black">
                {user.role === 'owner' ? 'storefront' : 'directions_car'}
              </span>
            </span>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <h3 className="font-headline-lg text-xl font-black text-primary leading-none">{user.name}</h3>
            <p className="text-on-surface-variant text-sm font-medium">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-primary-container/10 text-primary-container text-xs font-bold uppercase tracking-wider">
                {user.role === 'owner' ? 'Charger Host' : 'EV Driver'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-on-surface-variant text-xs font-bold">
                Wallet Balance: ₹{(user.balance ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-sm">person</span>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-on-surface font-body-md glass-input focus:border-primary-container/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Mobile Number</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-sm">call</span>
              <input 
                required
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-on-surface font-body-md glass-input focus:border-primary-container/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Vehicle Model & License</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-sm">directions_car</span>
              <input 
                required
                type="text" 
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g. Tesla Model 3 (ABC-1234)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-on-surface font-body-md glass-input focus:border-primary-container/50 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <button 
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-container text-on-primary-container py-3.5 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,135,0.2)] disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">save</span>
                  <span>Save Profile</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={handleClearProfile}
              className="flex-1 bg-white/5 hover:bg-white/10 text-on-surface-variant py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all cursor-pointer border border-white/10 active:scale-95"
            >
              Clear Saved Data
            </button>

            {showSuccess && (
              <div className="flex items-center gap-2 text-primary-container bg-primary-container/10 border border-primary-container/20 rounded-xl px-4 py-3 text-sm font-semibold animate-pulse justify-center">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Profile updated and synchronized successfully!</span>
              </div>
            )}
          </div>
        </form>

        <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
          <p className="text-on-surface-variant text-[11px] font-semibold text-center uppercase tracking-wider">
            Danger Zone
          </p>
          <button 
            type="button"
            onClick={handleReset}
            className="w-full bg-error-container/10 hover:bg-error-container/20 text-error py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-error-container/20 active:scale-[0.98]"
          >
            Reset Database & Clear Cache
          </button>
        </div>
      </div>

    </main>
  );
}
