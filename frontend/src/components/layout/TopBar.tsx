/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { reservationService } from '../../services/reservationService';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [nearestReservation, setNearestReservation] = useState<null | {
    id: number;
    roomName: string;
    startAt: string; 
  }>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
 
  useEffect(() => {
    const mountedRef = { current: true };

    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('workreserve-theme');
      
      if (savedTheme === 'dark' || savedTheme === 'light') {
        const isDark = savedTheme === 'dark';
        setDarkMode(isDark);
        applyTheme(isDark);
      } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(systemPrefersDark);
        applyTheme(systemPrefersDark);
        localStorage.setItem('workreserve-theme', systemPrefersDark ? 'dark' : 'light');
      }
    };
 
    initializeTheme();
    if (!user) return;
    const loadNearest = async () => {
      try {
        const n = await reservationService.getNearest();
        if (mountedRef.current) setNearestReservation(n);
      } catch (err) {
        console.debug('[TopBar] nearest fetch error', err);
      }
    };
 
    loadNearest();
    const iv = setInterval(loadNearest, 60_000);
    return () => {
      mountedRef.current = false;
      clearInterval(iv);
    };
  }, [user]);
 
  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
 
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyTheme(newDarkMode);
    
    localStorage.setItem('workreserve-theme', newDarkMode ? 'dark' : 'light');
  };

  const timeUntil = (iso?: string) => {
    if (!iso) return '';
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return 'Now';
    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if ((days === 0 && minutes > 0) || (parts.length === 0 && minutes > 0)) {
      parts.push(`${minutes}m`);
    }

    return parts.join(' ');
   };
  
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>
 
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" />
 
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {nearestReservation ? (
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3 w-full max-w-md">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Upcoming</span>
              <button
                type="button"
                onClick={() => navigate(`/reservations`)}
                title="Open next reservation"
                className="flex-1 flex items-center gap-3 rounded-md bg-white/60 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-2 py-1 shadow-sm hover:shadow transition text-sm"
              >
                <div className="h-8 w-8 flex-shrink-0 rounded-md bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                  {nearestReservation.roomName?.charAt(0) ?? 'R'}
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{nearestReservation.roomName}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {new Date(nearestReservation.startAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-sm font-semibold text-sky-600 dark:text-sky-300">{timeUntil(nearestReservation.startAt)}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">starts</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form className="relative flex flex-1" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">Search</label>
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
            <Input
              id="search-field"
              className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 bg-transparent"
              placeholder="Search rooms, bookings..."
              type="search"
              name="search"
            />
          </form>
        )}
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
 
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
 
          

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />
 
          <div className="flex items-center gap-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-medium shadow-lg">
              {user?.fullName?.charAt(0)}
            </div>
            <span className="hidden lg:flex lg:items-center">
              <span className="ml-2 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                {user?.fullName} 
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default TopBar;