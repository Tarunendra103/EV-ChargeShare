import React, { useState } from 'react';
import { useApp } from '../App.jsx';

export default function Login() {
  const { login } = useApp();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('driver'); // 'driver' or 'owner'
  const [email, setEmail] = useState('driver@chargeshare.com');
  const [password, setPassword] = useState('password123');
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle', 'loading', 'success'

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'register') {
      setEmail('host@chargeshare.com');
    } else {
      setEmail('driver@chargeshare.com');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthStatus('loading');

    const finalRole = mode === 'register' ? role : (email.includes('host') ? 'owner' : 'driver');

    setTimeout(() => {
      setAuthStatus('success');
      setTimeout(() => {
        login(email, finalRole);
      }, 1000);
    }, 1200);
  };

  const handleSocialAuth = () => {
    setAuthStatus('loading');
    setTimeout(() => {
      login('social.user@example.com', 'driver');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] lg:min-h-screen p-gutter-mobile md:p-gutter-desktop bg-background text-on-surface">
      <main className="w-full max-w-[480px] z-10 py-10">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,255,135,0.3)]">
            <span className="material-symbols-outlined text-on-primary-container text-[40px] material-symbols-fill">ev_station</span>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tighter">
            ChargeShare
          </h1>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1">Peer-to-peer energy marketplace</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Toggle Tabs */}
          <div className="flex bg-surface-container-lowest/50 p-1.5 rounded-full mb-8 relative">
            <div 
              className="absolute top-1.5 left-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] bg-primary-container rounded-full transition-all duration-300 ease-out" 
              style={{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
            />
            <button 
              className={`relative z-10 flex-1 py-2.5 font-label-md text-label-md transition-colors duration-300 ${
                mode === 'login' ? 'text-on-primary-container font-bold' : 'text-on-surface-variant'
              }`}
              onClick={() => handleModeChange('login')}
            >
              Login
            </button>
            <button 
              className={`relative z-10 flex-1 py-2.5 font-label-md text-label-md transition-colors duration-300 ${
                mode === 'register' ? 'text-on-primary-container font-bold' : 'text-on-surface-variant'
              }`}
              onClick={() => handleModeChange('register')}
            >
              Register
            </button>
          </div>

          {/* Forms Container */}
          <div className="relative">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Role Selection (Visible on Register) */}
              {mode === 'register' && (
                <div className="space-y-3">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`role-card cursor-pointer p-4 rounded-xl flex flex-col items-center gap-2 text-center group ${
                        role === 'driver' ? 'active' : ''
                      }`}
                      onClick={() => setRole('driver')}
                    >
                      <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${role === 'driver' ? 'text-primary-container' : 'text-on-surface-variant'}`}>electric_car</span>
                      <span className="font-label-md text-label-md text-on-surface">Driver</span>
                    </div>
                    <div 
                      className={`role-card cursor-pointer p-4 rounded-xl flex flex-col items-center gap-2 text-center group ${
                        role === 'owner' ? 'active' : ''
                      }`}
                      onClick={() => setRole('owner')}
                    >
                      <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${role === 'owner' ? 'text-primary-container' : 'text-on-surface-variant'}`}>home_work</span>
                      <span className="font-label-md text-label-md text-on-surface">Host</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                    <input 
                      required 
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/30" 
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                    {mode === 'login' && (
                      <a className="text-[11px] font-label-sm text-primary-container hover:underline" href="#" id="forgot-password">Forgot?</a>
                    )}
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                    <input 
                      required 
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/30" 
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                type="submit"
                disabled={authStatus !== 'idle'}
                className={`w-full font-label-md text-label-md py-4 rounded-xl transition-all glow-hover active:scale-[0.98] flex items-center justify-center gap-2 font-bold ${
                  authStatus === 'success' 
                    ? 'bg-surface-tint text-on-primary' 
                    : 'bg-primary-container text-on-primary-container'
                }`}
                id="btn-auth-submit"
              >
                {authStatus === 'idle' && (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
                {authStatus === 'loading' && (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                )}
                {authStatus === 'success' && (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Authenticated</span>
                  </>
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-white/5 w-full"></div>
                <span className="bg-background px-4 absolute text-[10px] font-label-sm text-on-surface-variant uppercase tracking-[0.2em]">Or Continue With</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleSocialAuth}
                  className="glass-card hover:bg-white/10 transition-colors py-3 rounded-xl flex items-center justify-center gap-2 group"
                >
                  <img alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCFWHrxKVv6BuQXsO240N7yAzkZKfkuLveNPCaWdKf_uifR2lKrknno6aFkxg4u7CJvnOk4wjp6ywzo4e4SKOvbBJ-mkiQa9OdeqmG5F1F9iyhl8d4KYzockgOP9KfNcS1YnLIls8H3yJBYIQa6XqpvOnJB1DAqBb7zXxhHI0nvpKN-NpiRLGNX26jG-q0gIQ9MeoRYcK_PXKmqnijePRYuVcvtQt9Cd-cNCc7GiEDrwx1WPk2DkmBOzWdOjFStaKDzEjOi5Ze19NF"/>
                  <span className="font-label-sm text-label-sm text-on-surface">Google</span>
                </button>
                <button 
                  onClick={handleSocialAuth}
                  className="glass-card hover:bg-white/10 transition-colors py-3 rounded-xl flex items-center justify-center gap-2 group"
                >
                  <span className="material-symbols-outlined text-on-surface text-[20px] material-symbols-fill">ios</span>
                  <span className="font-label-sm text-label-sm text-on-surface">Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Help */}
        <p className="text-center mt-8 font-body-md text-on-surface-variant text-sm opacity-60">
          Secure high-performance energy infrastructure.<br/>
          <span className="font-label-sm text-[10px] tracking-widest uppercase">Precision Guaranteed © 2026 ChargeShare</span>
        </p>
      </main>
    </div>
  );
}
