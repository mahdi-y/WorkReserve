/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import TimeSlotPicker from '../../components/timeslots/TimeSlotPicker';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { reservationService } from '../../services/reservationService';
import { Calendar, Clock, Users,  CheckCircle } from 'lucide-react';
import type { Room } from '../../services/roomService';
import type { TimeSlot } from '../../services/timeSlotService';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { room, filters } = location.state as { room?: Room; filters?: any } || {};
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [teamSize, setTeamSize] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm' | 'success'>('select');

  const calculateTotalCost = () => {
    if (!selectedTimeSlot) return 0;
    
    const startTime = new Date(`2000-01-01T${selectedTimeSlot.startTime}`);
    const endTime = new Date(`2000-01-01T${selectedTimeSlot.endTime}`);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    return selectedTimeSlot.room.pricePerHour * hours;
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot) {
      toast({
        title: "Error",
        description: "Please select a time slot",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      await reservationService.create({
        slotId: selectedTimeSlot.id,
        teamSize: teamSize
      });

      setBookingStep('success');
      
      toast({
        title: "Booking Successful!",
        description: "Your reservation has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || "Failed to create reservation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  if (bookingStep === 'success') {
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
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Your reservation has been successfully created.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div><strong>Room:</strong> {selectedTimeSlot?.room.name}</div>
                  <div><strong>Date:</strong> {selectedTimeSlot && formatDate(selectedTimeSlot.date)}</div>
                  <div><strong>Time:</strong> {selectedTimeSlot && `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`}</div>
                  <div><strong>Team Size:</strong> {teamSize} people</div>
                  <div><strong>Total Cost:</strong> {calculateTotalCost()} TND</div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => navigate('/dashboard')} className="flex-1">
                    View My Reservations
                  </Button>
                  <Button onClick={() => navigate('/rooms')} variant="outline" className="flex-1">
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6"
        >
          <h1 className="text-3xl font-bold mb-2">Book Your Workspace</h1>
          <p className="text-blue-100">
            {room ? `Complete your booking for ${room.name}` : 'Select a time slot and confirm your reservation'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Time Slot Selection */}
          <div className="lg:col-span-2">
            <TimeSlotPicker
              roomId={room?.id}
              selectedDate={filters?.date}
              onTimeSlotSelect={setSelectedTimeSlot}
              selectedTimeSlot={selectedTimeSlot}
            />
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedTimeSlot ? (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-semibold text-lg">{selectedTimeSlot.room.name}</h3>
                        <Badge className="mt-1">
                          {selectedTimeSlot.room.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-gray-500">Date</p>
                            <p className="font-medium">{formatDate(selectedTimeSlot.date)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-gray-500">Time</p>
                            <p className="font-medium">
                              {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-gray-500">Capacity</p>
                            <p className="font-medium">{selectedTimeSlot.room.capacity} people</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-gray-500">Rate</p>
                            <p className="font-medium">{selectedTimeSlot.room.pricePerHour} TND/hour</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        min="1"
                        max={selectedTimeSlot.room.capacity}
                        value={teamSize}
                        onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum {selectedTimeSlot.room.capacity} people
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Cost:</span>
                        <span>{calculateTotalCost()} TND</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleBooking}
                      disabled={loading || teamSize > selectedTimeSlot.room.capacity}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a time slot to continue</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;