import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WorkReserve</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;