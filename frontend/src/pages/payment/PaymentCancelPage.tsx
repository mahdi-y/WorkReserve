import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

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
              <h2 className="text-2xl font-bold mb-2">Payment Cancelled</h2>
              <p className="text-gray-600 mb-6">
                Your payment was cancelled. No charges were made.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/rooms')} className="w-full">
                  Continue Browsing Rooms
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PaymentCancelPage;