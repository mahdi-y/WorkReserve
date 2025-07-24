/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../../components/layout/Layout';
import RoomBookingCalendar from '../../components/timeslots/RoomBookingCalendarProps';
import PaymentForm from '../../components/payment/PaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { paymentService } from '../../services/paymentService';
import { Calendar, Clock, Users, CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import type { Room } from '../../services/roomService';
import type { TimeSlot } from '../../services/timeSlotService';

let stripePromise: Promise<any>;

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { room, filters } = location.state as { room?: Room; filters?: any } || {};
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [teamSize, setTeamSize] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm' | 'payment' | 'success'>('select');
  const [paymentIntent, setPaymentIntent] = useState<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const config = await paymentService.getConfig();
        stripePromise = loadStripe(config.publishableKey);
      } catch (error) {
        console.error('Failed to load Stripe config:', error);
      }
    };
    initializeStripe();
  }, []);

  const calculateTotalCost = () => {
    if (!selectedTimeSlot) return 0;
    
    const startTime = new Date(`2000-01-01T${selectedTimeSlot.startTime}`);
    const endTime = new Date(`2000-01-01T${selectedTimeSlot.endTime}`);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    return selectedTimeSlot.room.pricePerHour * hours;
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setBookingStep('confirm');
  };

  const handleProceedToPayment = async () => {
    if (!selectedTimeSlot) return;

    try {
      setLoading(true);
      
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        slotId: selectedTimeSlot.id,
        teamSize: teamSize
      }));
      
      const response = await paymentService.createPaymentIntent({
        slotId: selectedTimeSlot.id,
        teamSize: teamSize
      });

      setPaymentIntent(response);
      setBookingStep('payment');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to initialize payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!paymentIntent || !selectedTimeSlot) return;

    try {
      setLoading(true);
      
      await paymentService.confirmPayment({
        paymentIntentId: paymentIntent.paymentIntentId,
        slotId: selectedTimeSlot.id,
        teamSize: teamSize
      });

      setBookingStep('success');
      
      toast({
        title: "Booking Successful!",
        description: "Your payment has been processed and reservation created.",
      });
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || "Failed to confirm booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!room) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">No room selected for booking</p>
              <Button onClick={() => navigate('/rooms')}>
                Browse Rooms
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (bookingStep === 'success') {
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
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Booking Confirmed!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  Your payment has been processed and reservation created successfully.
                </p>
                <div className="space-y-3 text-sm text-left bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Room:</span>
                    <span className="text-gray-900 dark:text-white">{selectedTimeSlot?.room.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                    <span className="text-gray-900 dark:text-white">{selectedTimeSlot && formatDate(selectedTimeSlot.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Time:</span>
                    <span className="text-gray-900 dark:text-white">{selectedTimeSlot && `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Team Size:</span>
                    <span className="text-gray-900 dark:text-white">{teamSize} people</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 mt-3">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Total Paid:</span>
                    <span className="font-bold text-green-600 text-lg">{calculateTotalCost().toFixed(3)} $</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button onClick={() => navigate('/dashboard')} className="flex-1" size="lg">
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
  }

  if (bookingStep === 'payment' && paymentIntent && stripePromise) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              onClick={() => setBookingStep('confirm')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Booking Details
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Complete Payment
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Secure payment for {room.name}
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PaymentForm
                stripePromise={stripePromise}
                clientSecret={paymentIntent.clientSecret}
                amount={paymentIntent.amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                loading={loading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTimeSlot && (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-semibold text-lg">{selectedTimeSlot.room.name}</h3>
                        <Badge className="mt-2">
                          {selectedTimeSlot.room.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{formatDate(selectedTimeSlot.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">
                            {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Team Size:</span>
                          <span className="font-medium">{teamSize} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-medium">{selectedTimeSlot.room.pricePerHour} $/hour</span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total:</span>
                          <span className="text-blue-600">{paymentIntent.amount.toFixed(3)} $</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/rooms')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rooms
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Book {room.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select an available time slot from the calendar below
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RoomBookingCalendar
                roomId={room.id}
                roomInfo={{
                  id: room.id,
                  name: room.name,
                  type: room.type,
                  capacity: room.capacity,
                  pricePerHour: room.pricePerHour
                }}
                onTimeSlotSelect={handleTimeSlotSelect}
                selectedTimeSlot={selectedTimeSlot}
                initialDate={filters?.date}
              />
            </motion.div>
          </div>

          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-6 shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <CardTitle className="text-xl">
                    {bookingStep === 'select' ? 'Room Information' : 'Confirm Booking'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {bookingStep === 'select' ? (
                    <>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                          <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">{room.name}</h3>
                          <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {room.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Users className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Capacity</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{room.capacity} people</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Rate</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{room.pricePerHour} $/hour</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Select a time slot from the calendar</p>
                        <p className="text-gray-400 text-sm mt-1">Available slots are shown in green</p>
                      </div>
                    </>
                  ) : (
                    selectedTimeSlot && (
                      <>
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">{selectedTimeSlot.room.name}</h3>
                            <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              {selectedTimeSlot.room.type.replace(/_/g, ' ')}
                            </Badge>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Calendar className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Date</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedTimeSlot.date)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Clock className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Time</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="teamSize" className="text-base font-medium">Team Size</Label>
                          <Input
                            id="teamSize"
                            type="number"
                            min="1"
                            max={selectedTimeSlot.room.capacity}
                            value={teamSize}
                            onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                            className="mt-2 h-12 text-lg"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Maximum {selectedTimeSlot.room.capacity} people
                          </p>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center text-xl font-bold">
                            <span className="text-gray-700 dark:text-gray-300">Total Cost:</span>
                            <span className="text-green-600 dark:text-green-400">{calculateTotalCost().toFixed(3)} $</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button 
                            onClick={handleProceedToPayment}
                            disabled={loading || teamSize > selectedTimeSlot.room.capacity}
                            className="w-full h-12 text-lg"
                            size="lg"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Proceed to Payment
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            onClick={() => {
                              setSelectedTimeSlot(null);
                              setBookingStep('select');
                            }}
                            variant="outline"
                            className="w-full h-12 text-lg"
                            size="lg"
                          >
                            Change Time Slot
                          </Button>
                        </div>
                      </>
                    )
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;