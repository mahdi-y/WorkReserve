/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RoomsPage from './pages/rooms/RoomsPage';
import RoomDetailsPage from './pages/rooms/RoomDetailsPage';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth/verify" element={<VerifyEmailPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/:id"
          element={
            <ProtectedRoute>
              <RoomDetailsPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/landing" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;