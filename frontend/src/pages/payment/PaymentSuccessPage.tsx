/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../hooks/use-toast';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const timer = setTimeout(() => {
      handlePaymentConfirmation();
    }, 2000); 

    return () => clearTimeout(timer);
  }, [searchParams, retryCount]);

  const handlePaymentConfirmation = async () => {
    const paymentIntentId = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    
    const bookingData = sessionStorage.getItem('pendingBooking');
    
    if (!paymentIntentId || !bookingData) {
      setStatus('error');
      setErrorMessage('Missing payment or booking information');
      return;
    }

    try {
      const { slotId, teamSize } = JSON.parse(bookingData);
      
      if (retryCount > 0) {
        const delay = Math.min(2000 * Math.pow(2, retryCount), 15000); 
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await paymentService.confirmPayment({
        paymentIntentId,
        slotId: Number(slotId),
        teamSize: Number(teamSize)
      });

      sessionStorage.removeItem('pendingBooking');
      
      setStatus('success');
      
      toast({
        title: "Payment Successful!",
        description: "Your reservation has been confirmed.",
      });

    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || '';
      
      if ((errorMessage.includes('lock_timeout') || 
           errorMessage.includes('rate') || 
           error.response?.status === 429) && 
           retryCount < maxRetries) {
        
        setRetryCount(prev => prev + 1);
        toast({
          title: "Processing...",
          description: `Payment service busy, retrying... (${retryCount + 1}/${maxRetries})`,
        });
        return; 
      }
      
      if (errorMessage.includes('already reserved') || errorMessage.includes('conflict')) {
        setStatus('success');
        toast({
          title: "Payment Successful!",
          description: "Your reservation has been confirmed.",
        });
        return;
      }
      
      setStatus('error');
      setErrorMessage(errorMessage || 'Failed to confirm payment');
      
      toast({
        title: "Payment Error",
        description: errorMessage || "Failed to confirm payment",
        variant: "destructive"
      });
    }
  };

  if (status === 'processing') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
                <p className="text-gray-600">
                  Please wait while we confirm your payment and create your reservation...
                  {retryCount > 0 && (
                    <span className="block text-sm text-blue-600 mt-2">
                      Retry attempt {retryCount}/{maxRetries}
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (status === 'error') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Error</h2>
                <p className="text-gray-600 mb-6">
                  {errorMessage || 'There was an issue processing your payment.'}
                </p>
                <div className="space-y-3">
                  <Button onClick={() => navigate('/rooms')} className="w-full">
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/reservations')} variant="outline" className="w-full">
                    View My Reservations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto shadow-2xl">
            <CardContent className="p-8">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Your payment has been processed and reservation created successfully.
              </p>
              <div className="flex gap-3 mt-8">
                <Button onClick={() => navigate('/reservations')} className="flex-1" size="lg">
                  View My Reservations
                </Button>
                <Button onClick={() => navigate('/rooms')} variant="outline" className="flex-1" size="lg">
                  Book Another Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;