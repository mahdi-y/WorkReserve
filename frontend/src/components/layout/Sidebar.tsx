import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import {
  Home,
  Building2,
  BookOpen,
  User,
  LogOut,
  Shield,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse Rooms', href: '/rooms', icon: Building2 },
    { name: 'My Reservations', href: '/reservations', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (user?.role === 'ADMIN') {
    navigation.splice(4, 0, { name: 'Admin Panel', href: '/admin', icon: Shield });
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300
          ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div className="flex grow flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-20 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center transition-all duration-300 ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="flex items-center justify-center min-w-[2.5rem] h-10 px-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <img
                  className="h-8 w-auto max-w-12" 
                  src="/assets/images/workreserve-icon-logo1.png"
                  alt="WorkReserve"
                />
              </div>
              {!collapsed && (
                <div className="ml-4">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    WorkReserve
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Workspace Manager</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`
                        group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-blue-50 text-blue-700 shadow-md dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        }
                        ${collapsed ? 'justify-center px-0 mx-2' : ''}
                      `}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                        active 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300' 
                          : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {!collapsed && (
                        <span className="ml-3 truncate">{item.name}</span>
                      )}
                      {!collapsed && active && (
                        <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className={`flex items-center transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white text-sm font-semibold shadow-lg">
                {user?.fullName?.charAt(0)}
              </div>
              {!collapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full mt-3 justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign out
              </Button>
            )}
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className={`
            absolute top-20 -right-3 z-60
            flex items-center justify-center w-6 h-6
            bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600
            rounded-full shadow-lg hover:shadow-xl
            transition-all duration-200 hover:scale-110
            text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      <div className={`lg:hidden fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl">
          <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <img
                  className="h-6 w-6"
                  src="/assets/images/workreserve-icon-logo1.png"
                  alt="WorkReserve"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  WorkReserve
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Workspace Manager</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${active 
                        ? 'bg-blue-50 text-blue-700 shadow-md dark:bg-blue-900/20 dark:text-blue-400' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }
                    `}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                      active 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300' 
                        : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="ml-3 truncate">{item.name}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white text-sm font-semibold shadow-lg">
                {user?.fullName?.charAt(0)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;