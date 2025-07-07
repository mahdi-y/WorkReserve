import React from 'react';
import { motion } from 'framer-motion';
import RegisterForm from '../../components/auth/RegisterForm';
import topography from '../../assets/images/topography.svg';
import { CheckCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 overflow-hidden"
      style={{
        backgroundImage: `url(${topography})`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-2xl z-0" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-indigo-100/40 rounded-full blur-2xl z-0" style={{transform: 'translate(-50%, -50%)'}} />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-100/40 rounded-full blur-2xl z-0" />
      <div className="relative flex w-full max-w-7xl h-[1000px] shadow-2xl rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden z-10">
        <div className="flex-1 flex flex-col items-center justify-center p-10 h-full">
          <div className="flex flex-col items-center mb-4">
            <span>
              <img
                src="/src/assets/images/workreserve-icon-logo1.png"
                alt="WorkReserve Logo"
                className="w-28 h-28 object-contain"
              />
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-1">
              Create Your Account
            </h1>
            <p className="text-gray-600 mb-2 text-center">
              Sign up to start booking your workspace!
            </p>
          </div>
          <div className="w-full max-w-md mb-4 ">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-md bg-white/80 hover:bg-gray-50 transition"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 align-middle" />
                <span className="font-medium text-gray-700">Sign up with Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-md bg-white/80 hover:bg-gray-50 transition"
              >
                <img src="https://www.svgrepo.com/show/448239/microsoft.svg" alt="Microsoft" className="w-5 h-5 align-middle" />
                <span className="font-medium text-gray-700">Sign up with Microsoft</span>
              </button>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="mx-2 text-gray-400 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
          <div className="shadow-xl rounded-xl bg-white/70 backdrop-blur-md w-full max-w-md">
            <RegisterForm />
          </div>
          <div className="text-center text-xs text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} WorkReserve. All rights reserved.
          </div>
        </div>
        <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-blue-100/60 p-10 h-full">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-extrabold text-blue-700 mb-4">
              Why Join WorkReserve?
            </h2>
            <ul className="text-blue-900 space-y-4 text-lg">
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
              className="w-72 mb-6 mt-6 rounded-xl shadow"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;