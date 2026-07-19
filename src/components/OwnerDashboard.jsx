import React, { useEffect, useState } from 'react';
import { useApp } from '../App.jsx';

export default function OwnerDashboard() {
  const { db, login, toggleChargerStatus, deleteCharger, editCharger, endSession, acceptBooking, declineBooking } = useApp();
  const user = db.currentUser;
  const chargers = db.chargers;
  const reviews = db.reviews;
  const bookings = db.ownerBookings;

  // Active session and ending controls
  const activeSession = db.activeSession;
  const [endingSession, setEndingSession] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCharger, setEditingCharger] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(18);
  const [editPower, setEditPower] = useState('50 kW');
  const [editConnector, setEditConnector] = useState('CCS2');
  const [editHours, setEditHours] = useState('24/7 Access');

  // Role guard: if driver, switch to owner
  useEffect(() => {
    if (user.role === 'driver') {
      login(user.email, 'owner');
    }
  }, [user.role, user.email, login]);

  // Calculations
  const hostListings = chargers.filter(c => c.host === user.name);
  const hostListingIds = hostListings.map(c => c.id);
  const activeListingsCount = hostListings.filter(c => c.status === 'Available').length;

  // All bookings belong to this host (OwnerBooking has no chargerId field)
  const activeAndPending = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Active' || b.status === 'Accepted');
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const upcomingAndActive = activeAndPending;
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Declined');

  // Real calculations (non-simulated)
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const totalKwh = completedBookings.reduce((sum, b) => sum + (parseFloat(b.energy) || 0), 0);

  // Real Host Rating calculated from reviews of host's chargers
  const hostReviews = reviews.filter(r => hostListingIds.includes(r.chargerId));
  const hostRating = hostReviews.length > 0
    ? (hostReviews.reduce((sum, r) => sum + r.rating, 0) / hostReviews.length).toFixed(2)
    : "0.0";

  const handleStatusToggle = (chargerId, checked) => {
    toggleChargerStatus(chargerId, checked);
  };

  const handleDeleteClick = (chargerId) => {
    if (window.confirm("Are you sure you want to delete this charger listing?")) {
      deleteCharger(chargerId);
    }
  };

  const handleEditClick = (charger) => {
    setEditingCharger(charger);
    setEditName(charger.name);
    setEditPrice(charger.price);
    setEditPower(charger.power);
    setEditConnector(charger.connector);
    setEditHours(charger.hours || '24/7 Access');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingCharger) {
      editCharger(editingCharger.id, {
        name: editName,
        price: parseFloat(editPrice),
        power: editPower,
        connector: editConnector,
        hours: editHours
      });
      setIsEditModalOpen(false);
      setEditingCharger(null);
    }
  };

  const handleEndSession = () => {
    setEndingSession(true);
    setTimeout(() => {
      endSession();
      setEndingSession(false);
    }, 1000);
  };

  return (
    <main className="px-gutter-mobile py-24 lg:py-12 lg:px-12 max-w-7xl mx-auto space-y-10 min-h-screen text-on-surface">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-label-md text-label-md text-primary-container uppercase tracking-widest mb-1">Owner Dashboard</p>
          <h2 className="font-display-lg text-display-lg text-primary leading-tight">Earnings Overview</h2>
        </div>
        <div className="flex gap-2 bg-surface-container p-1 rounded-xl">
          <button className="px-6 py-2 rounded-lg bg-surface-variant text-primary font-label-md text-label-md">Monthly</button>
          <button className="px-6 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md" onClick={() => alert('Weekly visualization synced!')}>Weekly</button>
        </div>
      </header>

      {/* Active Session Monitor Card (Only visible to host/owner when session is running) */}
      {activeSession && (
        <section className="space-y-4">
          <h3 className="font-headline-lg text-headline-lg text-primary font-black flex items-center gap-3">
            Active Charger Monitor
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
          </h3>

          <div className="glass-card active-pulse rounded-3xl overflow-hidden relative group border border-primary-container/30 p-6 md:p-8">
            <div className="absolute inset-0 shimmer opacity-10 pointer-events-none"></div>
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden glass-card border-white/20 p-1 bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-4xl animate-pulse">bolt</span>
                </div>
                <div>
                  <h3 className="font-headline-lg-mobile text-lg font-black text-primary leading-tight">
                    {activeSession.chargerName} is Charging
                  </h3>
                  <p className="text-on-surface-variant flex items-center gap-1 mt-1 text-sm">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Driver: {activeSession.driverName || 'Driver'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-primary-container/10 text-primary-container font-label-sm text-[10px] font-bold uppercase tracking-wide">
                      Active Session
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-white/5 text-on-surface-variant font-label-sm text-[10px] uppercase">
                      {activeSession.energyDelivered} kWh Delivered
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-primary-container/15 text-primary-container font-label-sm text-[10px] uppercase font-bold">
                      ₹{(activeSession.actualPrice || 0).toFixed(2)} Charged
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end justify-center">
                <p className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider mb-1">Time Elapsed</p>
                <div className="flex gap-2 text-4xl md:text-5xl font-black text-primary-container tracking-tighter" id="timer">
                  <span>{Math.floor(activeSession.elapsedSeconds / 60).toString().padStart(2, '0')}</span>:
                  <span>{(activeSession.elapsedSeconds % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            {/* Charge progress bar */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider mb-1">Battery Level</p>
                  <div className="text-2xl font-black text-primary tracking-tight">
                    {activeSession.currentPercent}%
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider mb-1">Flow Rate</p>
                  <p className="text-lg font-bold text-primary-container">48 kW</p>
                </div>
              </div>
              
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full relative transition-all duration-300 shadow-[0_0_15px_rgba(0,255,135,0.4)]" 
                  style={{ width: `${activeSession.currentPercent}%` }}
                >
                  <div className="absolute inset-0 shimmer"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleEndSession}
                disabled={endingSession}
                className="bg-error text-white hover:brightness-110 font-bold px-6 py-3 rounded-xl active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,75,75,0.2)] cursor-pointer"
              >
                <span className="material-symbols-outlined">stop_circle</span>
                {endingSession ? 'Stopping...' : 'End Charging Session'}
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Bento Grid: Analytics & Earnings */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Earnings Card */}
        <div className="md:col-span-2 glass-card rounded-2xl p-8 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-on-surface-variant font-bold">Total Net Earnings</span>
              <span className="bg-primary-container/10 text-primary-container px-3 py-1 rounded-full font-label-sm text-label-sm font-bold">+12.4% vs last month</span>
            </div>
            <div className="mt-4">
              <span className="font-display-lg text-[56px] text-primary-container leading-none font-black">₹{totalEarnings.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Visualization bars */}
          <div className="h-32 mt-8 flex items-end gap-2 w-full relative">
            {completedBookings.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40 text-sm italic">
                No charging sessions completed yet.
              </div>
            ) : (
              <>
                <div className="flex-1 bg-primary-container/10 h-[40%] rounded-t-lg transition-all hover:bg-primary-container/30 hover:scale-y-105 origin-bottom duration-200 cursor-pointer" title="May: ₹0.00"></div>
                <div className="flex-1 bg-primary-container/10 h-[65%] rounded-t-lg transition-all hover:bg-primary-container/30 hover:scale-y-105 origin-bottom duration-200 cursor-pointer" title="Jun: ₹0.00"></div>
                <div className="flex-1 bg-primary-container/10 h-[55%] rounded-t-lg transition-all hover:bg-primary-container/30 hover:scale-y-105 origin-bottom duration-200 cursor-pointer" title="Jul: ₹0.00"></div>
                <div className="flex-1 bg-primary-container/40 h-[100%] rounded-t-lg transition-all hover:bg-primary-container/60 hover:scale-y-105 origin-bottom duration-200 cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,135,0.4)]" title={`Total Earnings: ₹${totalEarnings.toFixed(2)}`}></div>
              </>
            )}
          </div>
        </div>

        {/* Stats Sub-Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <span className="material-symbols-outlined text-primary-container mb-4 text-2xl font-bold">bolt</span>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant font-bold">Energy Delivered</p>
              <p className="font-headline-lg text-headline-lg text-primary font-black">{totalKwh.toFixed(1)} kWh</p>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <span className="material-symbols-outlined text-primary-container mb-4 text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant font-bold">Host Rating</p>
              <div className="flex items-center gap-2">
                <p className="font-headline-lg text-headline-lg text-primary font-black">
                  {hostRating === "0.0" ? "N/A" : hostRating}
                </p>
                <span className="text-on-surface-variant opacity-50 font-label-sm text-label-sm">({hostReviews.length} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Listings Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-lg text-headline-lg text-primary font-black">My Listings</h3>
          <span className="text-on-surface-variant text-xs" id="active-listings-count-label">
            {activeListingsCount} of {hostListings.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostListings.map(charger => {
            const isAvailable = charger.status === 'Available';
            const levelText = charger.connector === 'Type-1' ? 'Level 2' : 'Level 3';
            return (
              <div 
                key={charger.id}
                className={`glass-card rounded-2xl overflow-hidden group ${
                  isAvailable ? '' : 'opacity-80 border-dashed border-2'
                }`}
                id={`host-listing-card-${charger.id}`}
              >
                <div className="h-48 w-full relative bg-surface-container">
                  <img 
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isAvailable ? 'grayscale group-hover:grayscale-0' : 'grayscale opacity-30'
                    }`} 
                    id={`listing-img-${charger.id}`}
                    src={charger.image} 
                    alt={charger.name}
                  />
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-dim/40" id={`inactive-badge-container-${charger.id}`}>
                      <span className="font-label-md text-label-md text-white bg-on-error/80 px-4 py-2 rounded-full font-bold">Inactive</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-surface-dim/80 backdrop-blur-md px-3 py-1 rounded-lg font-label-sm text-label-sm text-primary-container border border-primary-container/30 font-bold">
                      {levelText}
                    </span>
                  </div>
                  
                  {/* Toggle checkbox switch */}
                  <div className="absolute top-4 right-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAvailable}
                        onChange={(e) => handleStatusToggle(charger.id, e.target.checked)}
                        className="sr-only peer toggle-listing-status" 
                        data-id={charger.id}
                      />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-headline-lg-mobile text-headline-lg-mobile ${isAvailable ? 'text-primary' : 'text-on-surface-variant'} font-bold truncate max-w-[200px]`} id={`listing-title-${charger.id}`}>
                      {charger.name}
                    </h4>
                    <span className={`${isAvailable ? 'text-primary-container' : 'text-on-surface-variant'} font-bold`}>
                      ₹{(charger.price ?? 0).toFixed(2)}/kWh
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-body-md text-body-md mb-4 truncate">{charger.location}</p>
                  
                  <div className="flex gap-4">
                    <div className={`flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm ${isAvailable ? '' : 'opacity-50'}`}>
                      <span className="material-symbols-outlined text-[16px] text-primary-container">bolt</span>
                      {charger.power}
                    </div>
                    <div className={`flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm ${isAvailable ? '' : 'opacity-50'}`}>
                      <span className="material-symbols-outlined text-[16px] text-primary-container">schedule</span>
                      {charger.hours || '24/7 Access'}
                    </div>
                    <div className={`flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm ${isAvailable ? '' : 'opacity-50'}`}>
                      <span className="material-symbols-outlined text-[16px] text-yellow-500 material-symbols-fill">star</span>
                      {(charger.reviewsCount ?? 0) > 0 ? (charger.rating ?? 0).toFixed(1) : 'N/A'}
                    </div>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-white/5 mt-4">
                    <button 
                      onClick={() => handleEditClick(charger)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-primary flex items-center gap-1 transition-all cursor-pointer border border-white/10"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(charger.id)}
                      className="px-4 py-2 rounded-xl bg-error-container/30 hover:bg-error-container/50 text-xs font-bold text-error flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking Requests & Upcoming Sessions */}
      <section className="space-y-6">
        <h3 className="font-headline-lg text-headline-lg text-primary font-bold">Booking Requests</h3>
        
        <div className="space-y-4">
          {upcomingAndActive.length === 0 ? (
            <div className="glass-card p-6 rounded-2xl text-center text-on-surface-variant text-sm italic">
              No active or pending booking requests.
            </div>
          ) : (
            upcomingAndActive.map(book => (
              <div key={book.id} className={`glass-card ${book.status === 'Active' ? 'active-pulse border-primary-container/20' : ''} rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${book.status === 'Active' ? 'border-primary-container' : 'border-white/10'} relative shrink-0`}>
                    <img className="w-full h-full object-cover" src={book.driverAvatar} alt={book.driverName}/>
                    {book.status === 'Active' && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary-container border-2 border-surface-dim rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">{book.driverName}</p>
                    <p className="text-on-surface-variant font-label-md text-label-md">{book.vehicle}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end flex-1 w-full md:w-auto">
                  <p className="font-body-lg text-body-lg text-primary font-bold">{book.timeText}</p>
                  <p className={`${book.status === 'Active' ? 'text-primary-container' : 'text-on-surface-variant'} font-label-md text-label-md font-semibold`}>
                    {book.status} • {book.durationText}
                  </p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto shrink-0">
                  {book.status === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => acceptBooking(book.id)}
                        className="flex-grow md:flex-none px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => declineBooking(book.id)}
                        className="flex-grow md:flex-none px-5 py-2.5 rounded-xl bg-error-container/20 text-error hover:bg-error-container/40 font-bold active:scale-95 transition-all cursor-pointer border border-error-container/20 text-xs uppercase tracking-wider"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => alert(`Message window opened for ${book.driverName}`)}
                        className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-surface-variant text-primary font-label-md text-label-md hover:bg-white/10 transition-all cursor-pointer"
                      >
                        Message
                      </button>
                      <span className="px-6 py-2 rounded-xl bg-primary-container/10 text-primary-container font-bold text-xs flex items-center justify-center border border-primary-container/20 uppercase tracking-wide">
                        {book.status === 'Confirmed' ? 'Accepted' : 'Charging Live'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Past Booking History */}
      <section className="space-y-6 pb-24">
        <h3 className="font-headline-lg text-headline-lg text-primary font-bold">Booking History</h3>
        
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="glass-card p-6 rounded-2xl text-center text-on-surface-variant text-sm italic">
              No past booking records.
            </div>
          ) : (
            pastBookings.map(book => (
              <div key={book.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 opacity-70">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 relative shrink-0">
                    <img className="w-full h-full object-cover" src={book.driverAvatar} alt={book.driverName}/>
                  </div>
                  <div>
                    <p className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">{book.driverName}</p>
                    <p className="text-on-surface-variant font-label-md text-label-md">{book.vehicle}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end flex-1 w-full md:w-auto">
                  <p className="font-body-lg text-body-lg text-primary font-bold">{book.timeText}</p>
                  <p className="text-on-surface-variant font-label-md text-label-md font-semibold">
                    {book.status} • {book.durationText}
                  </p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                  <span className={`px-6 py-2 rounded-xl font-bold text-xs flex items-center justify-center border uppercase tracking-wide ${
                    book.status === 'Completed'
                      ? 'bg-white/5 text-on-surface-variant/40 border-transparent'
                      : 'bg-error-container/10 text-error border-error-container/20'
                  }`}>
                    {book.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Floating Edit Charger Modal */}
      {isEditModalOpen && editingCharger && (
        <div id="modal-edit-form" className="fixed inset-0 z-50 flex items-center justify-center px-gutter-mobile bg-surface-container-lowest/70 backdrop-blur-md">
          <div className="glass-modal w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-lg-mobile text-lg font-black text-primary">Edit Charger Details</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-white/5 active:scale-95 transition-all"
              >
                close
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Charger Name</label>
                <input 
                  required
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-on-surface font-body-md glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Connector Type</label>
                  <select 
                    value={editConnector}
                    onChange={(e) => setEditConnector(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-on-surface font-body-md glass-input bg-surface-container-highest"
                  >
                    <option value="CCS2">CCS2</option>
                    <option value="Type 2">Type 2</option>
                    <option value="Tesla Supercharger">Tesla Supercharger</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Power Rate</label>
                  <select 
                    value={editPower}
                    onChange={(e) => setEditPower(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-on-surface font-body-md glass-input bg-surface-container-highest"
                  >
                    <option value="22 kW">22 kW</option>
                    <option value="50 kW">50 kW</option>
                    <option value="150 kW">150 kW</option>
                    <option value="350 kW">350 kW</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Pricing (₹/kWh)</label>
                <input 
                  required
                  type="number" 
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-on-surface font-body-md glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Hours</label>
                <input 
                  required
                  type="text" 
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-on-surface font-body-md glass-input"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,255,135,0.2)]"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
