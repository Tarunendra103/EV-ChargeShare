import React, { useEffect, useState } from 'react';
import { useApp } from '../App.jsx';

export default function Layout({ children }) {
  const { db, currentHash, logout } = useApp();
  const user = db.currentUser;

  const handleBack = () => {
    // Standard back behavior: go back to explore or dashboard depending on role
    if (user.role === 'owner') {
      window.location.hash = '#/owner-dashboard';
    } else {
      window.location.hash = '#/explore';
    }
  };

  const isExploreOrDashboard = 
    currentHash === '#/explore' || 
    currentHash === '#/driver-dashboard' || 
    currentHash === '#/owner-dashboard';

  return (
    <div className="min-h-screen text-on-surface font-body-md bg-background">
      
      {/* Global Header (Adaptive - Mobile only, hidden on desktop) */}
      <header id="global-header" className={`fixed top-0 w-full bg-surface/10 backdrop-blur-xl border-b border-white/10 shadow-sm z-50 flex justify-between items-center px-gutter-mobile py-4 h-16 lg:hidden`}>
        <div className="flex items-center gap-4">
          <button 
            id="header-back-btn" 
            onClick={handleBack}
            className={`active:scale-95 transition-transform flex items-center justify-center ${isExploreOrDashboard ? 'invisible' : ''}`}
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <span className="font-headline-lg-mobile text-headline-lg-mobile lg:font-headline-lg lg:text-headline-lg font-bold tracking-tighter text-primary-container cursor-pointer" onClick={() => window.location.hash = '#/'}>
            ChargeShare
          </span>
        </div>
        
        {/* Header Icons */}
        <div className="flex items-center gap-4">
          {db.activeSession && user.role === 'driver' && (
            <div 
              id="active-session-indicator" 
              className="flex items-center gap-2 bg-primary-container/10 px-3 py-1 rounded-full border border-primary-container/20 cursor-pointer animate-pulse" 
              onClick={() => window.location.hash = '#/driver-dashboard'}
            >
              <span className="w-2 h-2 bg-primary-container rounded-full"></span>
              <span className="text-xs font-label-sm text-primary-container">Charging Live</span>
            </div>
          )}
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-white/5 p-2 rounded-full cursor-pointer transition-colors" id="btn-notifications">notifications</button>
          <button 
            onClick={logout}
            className="material-symbols-outlined text-on-surface-variant hover:bg-white/5 p-2 rounded-full cursor-pointer transition-colors" 
            id="btn-logout" 
            title="Sign Out"
          >
            logout
          </button>
        </div>
      </header>

      {/* Side Navigation Bar (Desktop layout) */}
      <aside id="desktop-sidebar" className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 w-64 border-r border-white/10 bg-surface-container-low/80 backdrop-blur-2xl shadow-2xl">
        <div className="p-8 pt-20">
          <div className="mb-8">
            <h2 className="text-on-surface-variant font-label-sm text-[11px] mb-1 uppercase tracking-widest">Account Profile</h2>
            <p id="sidebar-user-name" className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary-container truncate">{user.name}</p>
            <span id="sidebar-user-role" className="text-xs font-label-sm uppercase tracking-wide opacity-50 block">
              {user.role === 'owner' ? 'Charger Host' : 'EV Driver'}
            </span>
          </div>
          
          <nav className="space-y-2">
            <a 
              id="sidebar-nav-explore" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentHash.startsWith('#/explore') || currentHash.startsWith('#/charger-details') || currentHash.startsWith('#/booking-confirmed')
                  ? 'bg-primary-container/10 text-primary-container border-l-4 border-primary-container' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`} 
              href="#/explore"
            >
              <span className="material-symbols-outlined">map</span>
              <span className="font-label-md text-label-md">Explore Map</span>
            </a>
            <a 
              id="sidebar-nav-bookings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentHash.startsWith('#/driver-dashboard') || currentHash.startsWith('#/add-charger')
                  ? 'bg-primary-container/10 text-primary-container border-l-4 border-primary-container' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`} 
              href="#/driver-dashboard"
            >
              <span className="material-symbols-outlined">calendar_today</span>
              <span id="sidebar-nav-bookings-label" className="font-label-md text-label-md">
                {user.role === 'owner' ? 'My Bookings' : 'My Dashboard'}
              </span>
            </a>
            <a 
              id="sidebar-nav-earnings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentHash.startsWith('#/owner-dashboard') 
                  ? 'bg-primary-container/10 text-primary-container border-l-4 border-primary-container' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`} 
              href="#/owner-dashboard"
            >
              <span className="material-symbols-outlined">payments</span>
              <span className="font-label-md text-label-md" id="sidebar-nav-earnings-label">
                {user.role === 'owner' ? 'Earnings' : 'Host Mode'}
              </span>
            </a>
            <a 
              id="sidebar-nav-reviews" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                currentHash.startsWith('#/reviews') 
                  ? 'bg-primary-container/10 text-primary-container border-l-4 border-primary-container' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`} 
              href="#/reviews"
            >
              <span className="material-symbols-outlined">star</span>
              <span className="font-label-md text-label-md">Reviews</span>
            </a>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/5 space-y-4">
          {user.role === 'owner' && (
            <button 
              id="sidebar-btn-add-charger" 
              className="w-full bg-primary-container text-on-primary-container font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,135,0.2)]" 
              onClick={() => window.location.hash = '#/add-charger'}
            >
              <span className="material-symbols-outlined font-bold">add</span>
              Add Charger
            </button>
          )}
          
          <div className="flex flex-col gap-2">
            <a 
              className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all ${
                currentHash === '#/profile' ? 'bg-primary-container/10 text-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`} 
              href="#/profile"
            >
              <span className="material-symbols-outlined text-sm">person</span> Profile
            </a>
            <a className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-2 text-sm" href="#/support">
              <span className="material-symbols-outlined text-sm">help</span> Support
            </a>
            <button 
              onClick={logout}
              id="sidebar-btn-logout" 
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-4 py-2 text-sm text-left rounded-lg transition-colors cursor-pointer w-full"
            >
              <span className="material-symbols-outlined text-sm">logout</span> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Wrapper (Adjusts margin based on screen size for sidebar) */}
      <div 
        id="view-wrapper" 
        className={`w-full ${
          // Padding/margin alignment matching exact window width adjustments
          'lg:pl-64 lg:pt-0 pt-16 pb-20'
        }`}
      >
        <div id="app-view">
          {children}
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile adaptive footer) */}
      <nav id="mobile-nav" className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface-dim/20 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_20px_rgba(0,255,135,0.1)] rounded-t-xl">
        <a 
          id="mobile-nav-explore" 
          className={`flex flex-col items-center justify-center transition-all ${
            currentHash.startsWith('#/explore') || currentHash.startsWith('#/charger-details') || currentHash.startsWith('#/booking-confirmed')
              ? 'text-primary-container scale-110' 
              : 'text-on-surface-variant opacity-60 active:scale-90'
          }`} 
          href="#/explore"
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="font-label-sm text-[10px] mt-0.5">Explore</span>
        </a>
        <a 
          id="mobile-nav-dashboard" 
          className={`flex flex-col items-center justify-center transition-all ${
            currentHash.startsWith('#/driver-dashboard') 
              ? 'text-primary-container scale-110' 
              : 'text-on-surface-variant opacity-60 active:scale-90'
          }`} 
          href="#/driver-dashboard"
        >
          <span className="material-symbols-outlined">history</span>
          <span id="mobile-nav-dashboard-label" className="font-label-sm text-[10px] mt-0.5">
            {user.role === 'owner' ? 'Bookings' : 'History'}
          </span>
        </a>
        {user.role === 'owner' && (
          <div className="relative -top-3">
            <button 
              id="mobile-nav-add" 
              className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container shadow-lg flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_15px_rgba(0,255,135,0.3)]" 
              onClick={() => window.location.hash = '#/add-charger'}
            >
              <span className="material-symbols-outlined font-bold text-2xl">add</span>
            </button>
          </div>
        )}
        <a 
          id="mobile-nav-earnings" 
          className={`flex flex-col items-center justify-center transition-all ${
            currentHash.startsWith('#/owner-dashboard') 
              ? 'text-primary-container scale-110' 
              : 'text-on-surface-variant opacity-60 active:scale-90'
          }`} 
          href="#/owner-dashboard"
        >
          <span className="material-symbols-outlined">bar_chart</span>
          <span className="font-label-sm text-[10px] mt-0.5" id="mobile-nav-earnings-label">
            {user.role === 'owner' ? 'Earnings' : 'Host'}
          </span>
        </a>
        <a 
          id="mobile-nav-profile" 
          className={`flex flex-col items-center justify-center transition-all ${
            currentHash.startsWith('#/profile') 
              ? 'text-primary-container scale-110' 
              : 'text-on-surface-variant opacity-60 active:scale-90'
          }`} 
          href="#/profile"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-[10px] mt-0.5">Profile</span>
        </a>
      </nav>

    </div>
  );
}
