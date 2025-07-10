/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { reservationService, type Reservation } from '../../services/reservationService';
import { timeSlotService } from '../../services/timeSlotService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { Calendar, Clock, Users, ArrowRight, Plus } from 'lucide-react';

const MyReservations: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [enrichedReservations, setEnrichedReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getMine();
      setReservations(data);
      
      // Enrich reservations with slot details (limit to 5 for dashboard)
      const enriched = await Promise.all(
        data.slice(0, 5).map(async (reservation) => {
          try {
            const slot = await timeSlotService.getTimeSlotById(reservation.slotId);
            return { ...reservation, slot };
          } catch (error) {
            console.error('Failed to load slot details:', error);
            return reservation;
          }
        })
      );
      
      setEnrichedReservations(enriched);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load reservations", 
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'default';
      case 'PENDING': return 'secondary';
      case 'CANCELLED': return 'destructive';
      case 'COMPLETED': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Reservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Reservations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/reservations')}
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {enrichedReservations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No reservations found</p>
            <Button onClick={() => navigate('/booking')}>
              <Plus className="w-4 h-4 mr-2" />
              Book Your First Room
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {enrichedReservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/reservations')}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">
                      {reservation.slot?.room?.name || `Room #${reservation.slotId}`}
                    </h4>
                    <Badge variant={getStatusColor(reservation.status)} className="mt-1">
                      {reservation.status}
                    </Badge>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    #{reservation.id}
                  </div>
                </div>

                {reservation.slot && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span>{formatDate(reservation.slot.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{formatTime(reservation.slot.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span>{reservation.teamSize} people</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{reservation.totalCost} TND</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {reservations.length > 5 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/reservations')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View {reservations.length - 5} more reservations
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyReservations;