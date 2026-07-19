import React, { useState, useEffect, createContext, useContext } from 'react';
import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import Explore from './components/Explore.jsx';
import ChargerDetails from './components/ChargerDetails.jsx';
import BookingConfirmed from './components/BookingConfirmed.jsx';
import DriverDashboard from './components/DriverDashboard.jsx';
import OwnerDashboard from './components/OwnerDashboard.jsx';
import AddCharger from './components/AddCharger.jsx';
import Reviews from './components/Reviews.jsx';
import Profile from './components/Profile.jsx';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const STORAGE_KEY = 'chargeshare_db';

const defaultSeedData = {
  currentUser: {
    isAuthenticated: true,
    role: 'driver',
    name: 'Alex Rivers',
    email: 'alex.rivers@example.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7ycmqOlE3QVmKX4uBdtpc1x7h8SVfNnhlxXFNoll7lL-weLxRL2M1WdIukWfXSIjn_vlCqGJW_DlmLDFhCIx-eT8-Id8q8K3pof2BKG4pxB6K4yu5NkVPQY80AEozpugogy4ijMEmq2rVKC_RHUzB2w_30QTdkPXsI3jnoJwaK1y1BafZYLrMpXpHfrprNLHDlupckV-tI0pxzb_k7OpaRzCvGTOdR3ZJai2d7yB6-wgeMLJ-PpK1ABQ9oTxvbVCL8yI0gb0JiHGZ',
    vehicle: 'Tesla Model 3 (ABC-1234)',
    balance: 5000.00,
    phone: '+91 98765 43210'
  },
  chargers: [],
  reviews: [],
  driverHistory: [],
  ownerBookings: [],
  activeSession: null, 
  upcomingBooking: null
};

export default function App() {
  const [db, setDb] = useState(() => {
    // Load local storage fallback initially
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return defaultSeedData;
  });

  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/explore');
  const [isLoading, setIsLoading] = useState(true);

  // Sync state to local storage and Spring Boot backend
  const syncDb = async (newDb) => {
    setDb(newDb);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDb)
      });
    } catch (e) {
      console.warn("Backend sync failed, using local storage:", e);
    }
  };

  // Load from database on startup
  useEffect(() => {
    const initDb = async () => {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const data = await res.json();
          setDb(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } catch (e) {
        console.warn("Could not load from backend, using local fallback:", e);
      } finally {
        setIsLoading(false);
      }
    };
    initDb();
  }, []);

  // Listen to hash change routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/explore';
      
      // Route guards
      if (!db.currentUser?.isAuthenticated && hash !== '#/login') {
        window.location.hash = '#/login';
        return;
      }
      if (db.currentUser?.isAuthenticated && (hash === '#/login' || hash === '#/')) {
        window.location.hash = db.currentUser.role === 'driver' ? '#/explore' : '#/owner-dashboard';
        return;
      }
      setCurrentHash(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [db.currentUser?.isAuthenticated, db.currentUser?.role]);

  // Charging Session Ticker (Ticks every second)
  useEffect(() => {
    if (!db.activeSession) return;

    const interval = setInterval(() => {
      const session = db.activeSession;
      if (!session) return;

      const percentSpan = session.targetPercent - session.startPercent;
      const elapsed = (session.elapsedSeconds || 0) + 1;
      const climbedPercent = Math.min(percentSpan, Math.floor(elapsed / 6));
      const currentPercent = session.startPercent + climbedPercent;

      if (currentPercent >= session.targetPercent) {
        // Complete session
        const nextDb = { ...db };
        const finishedSession = nextDb.activeSession;
        // Final calculations
        const finalEnergy = percentSpan * 0.7;
        const finalPrice = finalEnergy * finishedSession.price;

        // Add history
        nextDb.driverHistory = [
          {
            id: 'h-' + Date.now(),
            chargerName: finishedSession.chargerName,
            price: parseFloat(finalPrice.toFixed(2)),
            energy: finalEnergy.toFixed(1) + ' kWh',
            duration: (percentSpan * 0.1).toFixed(1) + ' hours',
            date: 'Today • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...nextDb.driverHistory
        ];

        // Deduct balance
        nextDb.currentUser = {
          ...nextDb.currentUser,
          balance: parseFloat((nextDb.currentUser.balance - finalPrice).toFixed(2))
        };

        // Complete host bookings if applicable
        nextDb.ownerBookings = nextDb.ownerBookings.map(o => {
          if (o.isActive && o.driverName === 'Alex Rivers') {
            return { 
              ...o, 
              status: 'Completed', 
              isActive: false,
              price: parseFloat(finalPrice.toFixed(2)),
              energy: finalEnergy
            };
          }
          return o;
        });

        nextDb.activeSession = null;
        syncDb(nextDb);
      } else {
        // Tick values
        const nextDb = { ...db };
        const nextSession = { ...nextDb.activeSession };
        
        nextSession.elapsedSeconds = elapsed;
        nextSession.currentPercent = currentPercent;
        
        const energyDelivered = climbedPercent * 0.7;
        nextSession.energyDelivered = parseFloat(energyDelivered.toFixed(1));
        nextSession.actualPrice = parseFloat((energyDelivered * nextSession.price).toFixed(2));
        
        nextDb.activeSession = nextSession;
        syncDb(nextDb);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [db.activeSession]);

  // Operations Context Values
  const login = (email, role) => {
    const nextDb = { ...db };
    const existingUser = db.currentUser;
    const isNewLogin = !existingUser || !existingUser.isAuthenticated || existingUser.email !== email;

    const name = isNewLogin 
      ? (role === 'driver' ? 'Alex Rivers' : 'Marcus R.') 
      : (existingUser.name || (role === 'driver' ? 'Alex Rivers' : 'Marcus R.'));
    
    const phone = isNewLogin 
      ? '+91 98765 43210' 
      : (existingUser.phone || '+91 98765 43210');
      
    const vehicle = isNewLogin 
      ? 'Tesla Model 3 (ABC-1234)' 
      : (existingUser.vehicle || 'Tesla Model 3 (ABC-1234)');
      
    const balance = isNewLogin 
      ? 5000.00 
      : (existingUser.balance !== undefined ? existingUser.balance : 5000.00);

    const avatar = isNewLogin
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7ycmqOlE3QVmKX4uBdtpc1x7h8SVfNnhlxXFNoll7lL-weLxRL2M1WdIukWfXSIjn_vlCqGJW_DlmLDFhCIx-eT8-Id8q8K3pof2BKG4pxB6K4yu5NkVPQY80AEozpugogy4ijMEmq2rVKC_RHUzB2w_30QTdkPXsI3jnoJwaK1y1BafZYLrMpXpHfrprNLHDlupckV-tI0pxzb_k7OpaRzCvGTOdR3ZJai2d7yB6-wgeMLJ-PpK1ABQ9oTxvbVCL8yI0gb0JiHGZ'
      : (existingUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7ycmqOlE3QVmKX4uBdtpc1x7h8SVfNnhlxXFNoll7lL-weLxRL2M1WdIukWfXSIjn_vlCqGJW_DlmLDFhCIx-eT8-Id8q8K3pof2BKG4pxB6K4yu5NkVPQY80AEozpugogy4ijMEmq2rVKC_RHUzB2w_30QTdkPXsI3jnoJwaK1y1BafZYLrMpXpHfrprNLHDlupckV-tI0pxzb_k7OpaRzCvGTOdR3ZJai2d7yB6-wgeMLJ-PpK1ABQ9oTxvbVCL8yI0gb0JiHGZ');

    nextDb.currentUser = {
      isAuthenticated: true,
      email,
      role,
      name,
      avatar,
      vehicle,
      balance,
      phone
    };
    syncDb(nextDb);
    window.location.hash = role === 'owner' ? '#/owner-dashboard' : '#/explore';
  };

  const logout = () => {
    const nextDb = { ...db };
    nextDb.currentUser = {
      isAuthenticated: false,
      role: 'driver',
      name: '',
      email: '',
      avatar: '',
      vehicle: '',
      balance: 0.0
    };
    nextDb.activeSession = null;
    nextDb.upcomingBooking = null;
    syncDb(nextDb);
    window.location.hash = '#/login';
  };

  const addCharger = (charger) => {
    const newCharger = {
      id: 'charger-' + Date.now(),
      rating: 0.0,
      reviewsCount: 0,
      ownedByUser: true,
      host: db.currentUser.name,
      hostAvatar: db.currentUser.avatar,
      ...charger
    };
    const nextDb = {
      ...db,
      chargers: [...db.chargers, newCharger]
    };
    syncDb(nextDb);
    return newCharger;
  };

  const toggleChargerStatus = (id, active) => {
    const nextDb = { ...db };
    nextDb.chargers = nextDb.chargers.map(c => {
      if (c.id === id) {
        return { ...c, status: active ? 'Available' : 'Busy' };
      }
      return c;
    });
    syncDb(nextDb);
  };

  const deleteCharger = (id) => {
    const nextDb = { ...db };
    nextDb.chargers = nextDb.chargers.filter(c => c.id !== id);
    nextDb.reviews = nextDb.reviews.filter(r => r.chargerId !== id);
    syncDb(nextDb);
  };

  const editCharger = (id, updatedFields) => {
    const nextDb = { ...db };
    nextDb.chargers = nextDb.chargers.map(c => {
      if (c.id === id) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    syncDb(nextDb);
  };

  const createBooking = (chargerId, date, timeSlot, currentPercent, targetPercent, estimatedCost) => {
    const charger = db.chargers.find(c => c.id === chargerId);
    const bookingId = 'ob-' + Date.now();

    const booking = {
      id: bookingId,
      chargerId,
      chargerName: charger ? charger.name : 'Unknown Charger',
      date,
      timeSlot,
      price: estimatedCost,
      status: 'Pending',
      stall: 'B-' + Math.floor(Math.random() * 10 + 1).toString().padStart(2, '0')
    };

    const nextDb = { ...db };
    nextDb.upcomingBooking = booking;
    nextDb.activeSession = null;

    const diffPercent = targetPercent - currentPercent;

    if (charger) {
      nextDb.ownerBookings = [
        {
          id: bookingId,
          chargerId,
          driverName: db.currentUser.name,
          driverAvatar: db.currentUser.avatar,
          vehicle: db.currentUser.vehicle,
          timeText: date + ', ' + timeSlot,
          durationText: 'Session (' + currentPercent + '% to ' + targetPercent + '%)',
          status: 'Pending',
          isActive: false,
          startPercent: currentPercent,
          targetPercent: targetPercent,
          price: parseFloat(estimatedCost),
          energy: parseFloat((diffPercent * 0.7).toFixed(1))
        },
        ...nextDb.ownerBookings
      ];
    }

    syncDb(nextDb);
    return booking;
  };

  const acceptBooking = (bookingId) => {
    const nextDb = { ...db };
    nextDb.ownerBookings = nextDb.ownerBookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'Confirmed' };
      }
      return b;
    });

    if (nextDb.upcomingBooking && nextDb.upcomingBooking.id === bookingId) {
      nextDb.upcomingBooking = { ...nextDb.upcomingBooking, status: 'Accepted' };
    }

    syncDb(nextDb);
  };

  const declineBooking = (bookingId) => {
    const nextDb = { ...db };
    nextDb.ownerBookings = nextDb.ownerBookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'Declined' };
      }
      return b;
    });

    if (nextDb.upcomingBooking && nextDb.upcomingBooking.id === bookingId) {
      nextDb.upcomingBooking = { ...nextDb.upcomingBooking, status: 'Declined' };
    }

    syncDb(nextDb);
  };

  const startChargingSession = (bookingId) => {
    const nextDb = { ...db };
    const booking = nextDb.ownerBookings.find(b => b.id === bookingId);
    if (!booking) return;

    nextDb.ownerBookings = nextDb.ownerBookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'Active', isActive: true };
      }
      return b;
    });

    nextDb.activeSession = {
      chargerId: booking.chargerId,
      chargerName: db.chargers.find(c => c.id === booking.chargerId)?.name || 'Charger',
      price: db.chargers.find(c => c.id === booking.chargerId)?.price || 18.0,
      startPercent: booking.startPercent,
      targetPercent: booking.targetPercent,
      currentPercent: booking.startPercent,
      elapsedSeconds: 0,
      energyDelivered: 0.0,
      actualPrice: 0.0,
      estimatedCost: booking.price
    };

    nextDb.upcomingBooking = null;
    syncDb(nextDb);
  };

  const addReview = (chargerId, rating, text, tags = []) => {
    const newReview = {
      id: 'rev-' + Date.now(),
      chargerId,
      userName: db.currentUser.name,
      avatar: db.currentUser.avatar,
      rating: parseInt(rating),
      text,
      date: 'Just now',
      tags,
      helpfulCount: 0,
      location: 'Bengaluru'
    };

    const nextDb = { ...db };
    nextDb.reviews = [newReview, ...nextDb.reviews];

    // Update charger ratings
    nextDb.chargers = nextDb.chargers.map(c => {
      if (c.id === chargerId) {
        const chargerReviews = nextDb.reviews.filter(r => r.chargerId === chargerId);
        const totalScore = chargerReviews.reduce((sum, r) => sum + r.rating, 0);
        return {
          ...c,
          rating: parseFloat((totalScore / chargerReviews.length).toFixed(2)),
          reviewsCount: chargerReviews.length
        };
      }
      return c;
    });

    syncDb(nextDb);
    return newReview;
  };

  const incrementHelpful = (reviewId) => {
    const nextDb = { ...db };
    nextDb.reviews = nextDb.reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    });
    syncDb(nextDb);
  };

  const endSession = () => {
    const nextDb = { ...db };
    const session = nextDb.activeSession;
    if (!session) return;

    const percentSpan = session.targetPercent - session.startPercent;
    const finalEnergy = session.energyDelivered > 0 ? session.energyDelivered : percentSpan * 0.7;
    const finalPrice = finalEnergy * session.price;

    // Add history
    nextDb.driverHistory = [
      {
        id: 'h-' + Date.now(),
        chargerName: session.chargerName,
        price: parseFloat(finalPrice.toFixed(2)),
        energy: finalEnergy.toFixed(1) + ' kWh',
        duration: (percentSpan * 0.1).toFixed(1) + ' hours',
        date: 'Today • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...nextDb.driverHistory
    ];

    // Deduct balance
    nextDb.currentUser = {
      ...nextDb.currentUser,
      balance: parseFloat((nextDb.currentUser.balance - finalPrice).toFixed(2))
    };

    // Complete host bookings if applicable
    nextDb.ownerBookings = nextDb.ownerBookings.map(o => {
      if (o.isActive && o.driverName === 'Alex Rivers') {
        return { 
          ...o, 
          status: 'Completed', 
          isActive: false,
          price: parseFloat(finalPrice.toFixed(2)),
          energy: finalEnergy
        };
      }
      return o;
    });

    nextDb.activeSession = null;
    syncDb(nextDb);
  };

  const updateProfile = (name, phone, vehicle) => {
    const nextDb = { ...db };
    nextDb.currentUser = {
      ...nextDb.currentUser,
      name,
      phone,
      vehicle
    };
    syncDb(nextDb);
  };

  const clearUpcomingBooking = () => {
    const nextDb = { ...db };
    nextDb.upcomingBooking = null;
    syncDb(nextDb);
  };

  const resetDatabase = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const freshDb = {
          ...defaultSeedData,
          currentUser: { ...defaultSeedData.currentUser }
        };
        setDb(freshDb);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshDb));
      }
    } catch (e) {
      console.warn("Backend reset failed:", e);
    }
  };

  // Helper to parse dynamic paths like details/:id
  const parseRoute = () => {
    if (currentHash === '#/login') return { view: 'login', params: {} };
    if (currentHash === '#/explore') return { view: 'explore', params: {} };
    if (currentHash.startsWith('#/charger-details/')) {
      const id = currentHash.split('/')[2];
      return { view: 'details', params: { id } };
    }
    if (currentHash === '#/booking-confirmed') return { view: 'confirmed', params: {} };
    if (currentHash === '#/driver-dashboard') return { view: 'driver-dashboard', params: {} };
    if (currentHash === '#/owner-dashboard') return { view: 'owner-dashboard', params: {} };
    if (currentHash === '#/add-charger') return { view: 'add-charger', params: {} };
    if (currentHash === '#/reviews') return { view: 'reviews', params: {} };
    if (currentHash === '#/profile') return { view: 'profile', params: {} };
    return { view: 'explore', params: {} };
  };

  const { view, params } = parseRoute();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary-container">refresh</span>
      </div>
    );
  }

  // Value pack for context
  const contextValue = {
    db,
    currentHash,
    login,
    logout,
    addCharger,
    toggleChargerStatus,
    deleteCharger,
    editCharger,
    createBooking,
    acceptBooking,
    declineBooking,
    startChargingSession,
    clearUpcomingBooking,
    addReview,
    incrementHelpful,
    endSession,
    updateProfile,
    resetDatabase
  };

  return (
    <AppContext.Provider value={contextValue}>
      {view === 'login' ? (
        <Login />
      ) : (
        <Layout>
          {view === 'explore' && <Explore />}
          {view === 'details' && <ChargerDetails chargerId={params.id} />}
          {view === 'confirmed' && <BookingConfirmed />}
          {view === 'driver-dashboard' && <DriverDashboard />}
          {view === 'owner-dashboard' && <OwnerDashboard />}
          {view === 'add-charger' && <AddCharger />}
          {view === 'reviews' && <Reviews />}
          {view === 'profile' && <Profile />}
        </Layout>
      )}
    </AppContext.Provider>
  );
}
