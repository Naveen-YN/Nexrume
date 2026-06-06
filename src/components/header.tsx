import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../context/store';
import { 
  Bell, Menu, X, 
  LayoutDashboard, Briefcase, FileText, Settings 
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCopilot?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCopilot, unreadCount }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      if (!navContainerRef.current) return;
      const activeEl = navContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth
        });
      }
    };

    updateIndicator();
    
    // Create a small delay to handle layout settling
    const timer = setTimeout(updateIndicator, 50);

    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab]);

  const { 
    userProfile, 
    notifications,
    markNotificationRead,
    updateProfile
  } = useAppStore();
  
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const expText = userProfile.experience?.toLowerCase().includes('fresher')
    ? 'Fresher'
    : `${userProfile.experience} exp`;

  return (
    <header ref={headerRef} className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md text-white flex items-center justify-between px-4 md:px-6 shrink-0 z-35 select-none sticky top-0">
      <div className="flex items-center gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <img 
            src="/brand-logo.png" 
            alt="Nexrume Logo" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-extrabold text-white text-base tracking-wider font-sans">NEXRUME</span>
        </div>
      </div>

      {/* Center Navigation menu instead of Search - Hidden on Mobile */}
      <nav className="hidden lg:flex items-center justify-center flex-1">
        <div ref={navContainerRef} className="relative flex items-center bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/30 p-1 rounded-full gap-0.5">
          {/* Sliding active indicator capsule */}
          {indicatorStyle.width > 0 && (
            <div 
              className="absolute top-1 bottom-1 bg-gradient-to-r from-indigo-650 to-indigo-500 rounded-full transition-all duration-300 shadow-md shadow-indigo-650/15 z-0"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`
              }}
            />
          )}
          
          {[
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "tracker", label: "Job Tracker", icon: Briefcase },
            { id: "resumes", label: "Resume & ATS Studio", icon: FileText },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-active={isActive ? "true" : "false"}
                onClick={() => setActiveTab(item.id)}
                className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 transform active:scale-95 cursor-pointer ${
                  isActive
                    ? "text-white font-extrabold scale-105"
                    : "text-zinc-400 hover:text-zinc-200 hover:scale-[1.02]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Actions Hub */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsDropdownOpen(false);
              setIsMobileMenuOpen(false);
              notifications.forEach(n => {
                if (!n.read) markNotificationRead(n.id);
              });
            }}
            className="relative cursor-pointer text-zinc-400 hover:text-zinc-200 transition-all duration-200 focus:outline-none p-1.5 rounded-lg hover:bg-zinc-900/50"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-3 z-50 animate-scale-in text-xs text-left max-h-[320px] overflow-y-auto scrollbar-thin">
              <div className="px-3.5 pb-2 border-b border-zinc-850 flex justify-between items-center text-zinc-400 font-bold">
                <span>Notifications Feed</span>
                <button 
                  onClick={() => useAppStore.getState().clearNotifications()}
                  className="text-[10px] text-indigo-400 hover:underline font-semibold transition"
                >
                  Clear All
                </button>
              </div>
              <div className="divide-y divide-zinc-850/50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-zinc-650 italic">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 hover:bg-zinc-850/30 transition duration-200">
                      <span className="font-bold text-zinc-200 block leading-tight">{notif.title}</span>
                      <p className="text-zinc-400 text-[11px] mt-0.5 leading-normal">{notif.message}</p>
                      <span className="text-[9px] text-zinc-550 mt-1 block font-mono">{notif.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:block h-6 w-px bg-zinc-900"></div>

        {/* Profile Avatar with Dropdown */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotifOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-zinc-900/50 transition duration-200 focus:outline-none cursor-pointer"
          >
            <img 
              src={userProfile.profilePhoto} 
              alt={userProfile.name}
              className="w-7.5 h-7.5 rounded-full border border-zinc-800 object-cover"
            />
            <div className="hidden md:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                <span>{userProfile.name}</span>
                <span className="text-[7px] text-zinc-500">▼</span>
              </span>
              <span className="text-[9.5px] text-zinc-500 font-semibold mt-0.5">{expText}</span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-60 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in text-xs text-left backdrop-blur-xl">
              
              {/* Profile Card Header */}
              <div className="p-3 border-b border-zinc-850 flex items-center gap-3">
                <img 
                  src={userProfile.profilePhoto || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"} 
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full border border-zinc-800 object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-sm truncate">{userProfile.name}</span>
                  <span className="text-[10px] text-indigo-400 font-semibold truncate uppercase tracking-wider">{expText || 'User'}</span>
                  <span className="text-[9.5px] text-zinc-500 font-mono truncate mt-0.5">{userProfile.email}</span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1.5 space-y-0.5">
                <button 
                  onClick={() => {
                    setActiveTab('settings');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-sm">👤</span>
                  <span>My Profile</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('tracker');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-sm">💼</span>
                  <span>Job Tracker</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('resumes');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-sm">📄</span>
                  <span>Resume Studio</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('settings');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-sm">⚙️</span>
                  <span>Settings</span>
                </button>
              </div>

              {/* Theme Toggle section */}
              <div className="px-3 py-2.5 border-t border-zinc-850 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Theme</span>
                <button 
                  onClick={() => {
                    const themes = ['dark', 'light', 'cyberpunk'] as const;
                    const nextTheme = themes[(themes.indexOf(userProfile.theme || 'dark') + 1) % themes.length];
                    updateProfile({ theme: nextTheme });
                  }}
                  className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition text-[10px] font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer capitalize"
                >
                  <span>{userProfile.theme === 'dark' ? '🌙' : userProfile.theme === 'light' ? '☀️' : '⚡'}</span>
                  <span>{userProfile.theme || 'dark'}</span>
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="pt-1.5 border-t border-zinc-855">
                <button 
                  onClick={() => {
                    useAppStore.getState().logoutUser();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-rose-400 hover:bg-rose-950/20 hover:text-rose-350 rounded-lg transition flex items-center gap-2.5 cursor-pointer font-semibold"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-sm">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            setIsNotifOpen(false);
            setIsDropdownOpen(false);
          }}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition duration-200 focus:outline-none cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-zinc-200" /> : <Menu className="w-5 h-5 text-zinc-400" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-zinc-950/95 border-b border-zinc-900/80 backdrop-blur-xl flex flex-col p-4.5 space-y-2 z-45 animate-slide-down">
          {[
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "tracker", label: "Job Tracker", icon: Briefcase },
            { id: "resumes", label: "Resume & ATS Studio", icon: FileText },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4.5 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-900/40 via-indigo-800/30 to-zinc-900/30 text-white border border-indigo-500/20 shadow-md shadow-indigo-950/20 font-extrabold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
