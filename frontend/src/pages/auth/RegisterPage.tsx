import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RegisterForm from '../../components/auth/RegisterForm';
import topography from '../../assets/images/topography.svg';
import { CheckCircle, Sun, Moon } from 'lucide-react';
import { Button } from '../../components/ui/button';

const RegisterPage: React.FC = () => {
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
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 overflow-hidden transition-colors"
      style={{
        backgroundImage: `url(${topography})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundBlendMode: darkMode ? 'overlay' : 'normal',
        opacity: darkMode ? 0.9 : 1,
      }}
    >
      <div 
        className="absolute inset-0 z-0 dark:opacity-40 opacity-0 transition-opacity"
        style={{
          backgroundImage: `url(${topography})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          filter: 'invert(1) contrast(1.5)',
        }}
      />
      
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-300/25 dark:bg-blue-400/15 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-indigo-200/25 dark:bg-indigo-400/15 rounded-full blur-3xl z-0" style={{ transform: 'translate(-50%, -50%)' }} />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-200/25 dark:bg-purple-400/15 rounded-full blur-3xl z-0" />
      <div className="absolute top-20 right-20 w-[250px] h-[250px] bg-cyan-200/15 dark:bg-cyan-400/10 rounded-full blur-2xl z-0" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors backdrop-blur-sm bg-white/15 dark:bg-gray-800/15 rounded-full"
        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      >
        {darkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      <div className="relative flex w-full max-w-7xl h-[1000px] shadow-2xl rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm overflow-hidden z-10 border border-white/10 dark:border-gray-700/10">
        <div className="flex-1 flex flex-col items-center justify-center p-10 h-full">
          <div className="flex flex-col items-center mb-4">
            <span>
              <img
                src="/src/assets/images/workreserve-icon-logo1.png"
                alt="WorkReserve Logo"
                className="w-28 h-28 object-contain"
              />
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-1">
              Create Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-2 text-center">
              Sign up to start booking your workspace!
            </p>
          </div>
          <div className="w-full max-w-md mb-4 ">

          </div>
          <div className="shadow-xl rounded-xl bg-white/25 dark:bg-gray-800/25 backdrop-blur-sm w-full max-w-md border border-white/15 dark:border-gray-700/15">
            <RegisterForm />
          </div>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} WorkReserve. All rights reserved.
          </div>
        </div>
        <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-blue-100/40 to-indigo-100/40 dark:from-blue-900/20 dark:to-indigo-900/20 p-10 h-full backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-200 mb-4">
              Why Join WorkReserve?
            </h2>
            <ul className="text-blue-900 dark:text-blue-100 space-y-4 text-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" />
                <span>Instantly book desks & meeting rooms</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" />
                <span>Track and manage all your reservations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" />
                <span>Get notified about your bookings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" />
                <span>Enjoy secure, fast authentication</span>
              </li>
            </ul>
            <img
              src="/src/assets/images/coworking-illustration.jpg"
              alt="Workspace"
              className="w-72 mb-6 mt-6 rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;