import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <span className="">
            <img
              src="/src/assets/images/workreserve-icon-logo1.png"
              alt="WorkReserve Logo"
              className="w-36 h-36 object-contain"
            />
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">WorkReserve</h1>
          <p className="text-gray-600 mb-2">Workspace Reservation System</p>
        </div>
        <div className="shadow-xl rounded-xl bg-white/90 backdrop-blur-md">
          <LoginForm />
        </div>
        <div className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} WorkReserve. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;