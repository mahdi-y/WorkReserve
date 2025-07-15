import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../../components/auth/LoginForm';
import topography from '../../assets/images/topography.svg';
import { CheckCircle, Sun, Moon } from 'lucide-react';
import { Button } from '../../components/ui/button';

const LoginPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
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
  }, []);

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyTheme(newDarkMode);
    localStorage.setItem('workreserve-theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden transition-colors"
      style={{
        backgroundImage: `url(${topography})`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-blue-200/40 dark:bg-blue-900/40 rounded-full blur-2xl z-0" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-indigo-100/40 dark:bg-indigo-900/40 rounded-full blur-2xl z-0" style={{ transform: 'translate(-50%, -50%)' }} />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-100/40 dark:bg-blue-900/40 rounded-full blur-2xl z-0" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      >
        {darkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      <div className="relative flex w-full max-w-7xl h-[1000px] shadow-2xl rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md overflow-hidden z-10">
        <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-blue-100/60 dark:bg-blue-900/60 p-10 h-full">
          <img
            src="/src/assets/images/meeting-illustration.jpg"
            alt="Workspace"
            className="w-72 mb-6 rounded-xl shadow"
          />
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
            Welcome to WorkReserve
          </h2>
          <ul className="text-blue-900 dark:text-blue-100 space-y-2 text-lg">
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Book desks & rooms easily
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Secure & fast authentication
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Manage your reservations
            </li>
          </ul>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-10 h-full space-y-8">
          <div className="flex flex-col items-center text-center">
            <span>
              <img
                src="/src/assets/images/workreserve-icon-logo1.png"
                alt="WorkReserve Logo"
                className="w-32 h-32 object-contain"
              />
            </span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 mt--3">
              WorkReserve
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Workspace Reservation System
            </p>
          </div>
          
          <div className="shadow-xl rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md w-full max-w-md p-4">
            <LoginForm />
          </div>
          <div className="text-center text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} WorkReserve. All rights reserved.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;