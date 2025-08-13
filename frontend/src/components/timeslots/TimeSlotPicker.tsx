/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { timeSlotService, type TimeSlot } from '../../services/timeSlotService';
import { useToast } from '../../hooks/use-toast';

interface TimeSlotPickerProps {
  roomId: number;
  selectedDate: string;
  onTimeSlotSelect: (slot: any) => void;
  selectedTimeSlot: any;
  loading?: boolean; //
  error?: string;  
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  roomId,
  selectedDate,
  onTimeSlotSelect,
  selectedTimeSlot
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(selectedDate || '');
  const { toast } = useToast();

  useEffect(() => {
    if (date) {
      loadTimeSlots();
    }
  }, [date, roomId]);

  const loadTimeSlots = async () => {
    if (!date) return;

    try {
      setLoading(true);
      const endDate = date; 
      const availableSlots = await timeSlotService.getAvailableTimeSlots(date, endDate);
      
      const filteredSlots = roomId 
        ? availableSlots.filter(slot => slot.room.id === roomId)
        : availableSlots;
      
      setTimeSlots(filteredSlots);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available time slots",
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

  const groupTimeSlotsByRoom = () => {
    const grouped = timeSlots.reduce((acc, slot) => {
      const roomKey = `${slot.room.id}-${slot.room.name}`;
      if (!acc[roomKey]) {
        acc[roomKey] = {
          room: slot.room,
          slots: []
        };
      }
      acc[roomKey].slots.push(slot);
      return acc;
    }, {} as Record<string, { room: TimeSlot['room'], slots: TimeSlot[] }>);

    return Object.values(grouped);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Select Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {date && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 inline mr-2" />
              {formatDate(date)}
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && date && timeSlots.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No available time slots for this date
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && timeSlots.length > 0 && (
        <div className="space-y-6">
          {groupTimeSlotsByRoom().map(({ room, slots }) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {room.name}
                  <Badge className="ml-2" variant="secondary">
                    {room.type.replace(/_/g, ' ')}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {room.capacity} people
                  </div>
                  <div>
                    {room.pricePerHour} $/hour
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {slots.map((slot) => (
                    <motion.div
                      key={slot.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                        className={`w-full h-auto p-4 flex flex-col items-center justify-center ${
                          selectedTimeSlot?.id === slot.id 
                            ? "bg-blue-600 text-white" 
                            : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                        onClick={() => onTimeSlotSelect?.(slot)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {formatTime(slot.startTime)}
                          </span>
                        </div>
                        <div className="text-xs opacity-75">
                          to {formatTime(slot.endTime)}
                        </div>
                        {selectedTimeSlot?.id === slot.id && (
                          <CheckCircle className="w-4 h-4 mt-2" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;