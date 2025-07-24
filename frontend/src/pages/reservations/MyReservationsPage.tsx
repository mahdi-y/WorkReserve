/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { reservationService, type Reservation } from '../../services/reservationService';
import { timeSlotService } from '../../services/timeSlotService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  AlertCircle, 
  Filter,
  Search,
  Plus,
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  CalendarDays
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const MyReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [enrichedReservations, setEnrichedReservations] = useState<any[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
    totalSpent: 0
  });

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [enrichedReservations, searchTerm, statusFilter, dateFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getMine();
      setReservations(data);
      
      const enriched = await Promise.all(
        data.map(async (reservation) => {
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
      
      const newStats = {
        total: enriched.length,
        confirmed: enriched.filter(r => r.status === 'CONFIRMED').length,
        pending: enriched.filter(r => r.status === 'PENDING').length,
        cancelled: enriched.filter(r => r.status === 'CANCELLED').length,
        completed: enriched.filter(r => r.status === 'COMPLETED').length,
        totalSpent: enriched.reduce((sum, r) => sum + (r.totalCost || 0), 0)
      };
      setStats(newStats);
      
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

  const filterReservations = () => {
    let filtered = [...enrichedReservations];

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.slot?.room?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(r => {
        if (!r.slot) return false;
        const slotDate = new Date(r.slot.date);
        
        switch (dateFilter) {
          case 'upcoming':
            return slotDate >= now;
          case 'past':
            return slotDate < now;
          case 'this_week':
            { const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return slotDate >= weekStart && slotDate <= weekEnd; }
          case 'this_month':
            return slotDate.getMonth() === now.getMonth() && slotDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredReservations(filtered);
  };

  const handleCancel = async (id: number) => {
    try {
      await reservationService.cancel(id);
      loadReservations();
      toast({ 
        title: "Reservation Cancelled",
        description: "Your reservation has been successfully cancelled."
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to cancel reservation", 
        variant: "destructive" 
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'default';
      case 'PENDING': return 'secondary';
      case 'CANCELLED': return 'destructive';
      case 'COMPLETED': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const canCancelReservation = (reservation: any) => {
    if (reservation.status === 'CANCELLED' || reservation.status === 'COMPLETED') {
      return false;
    }
    
    if (reservation.slot) {
      const slotDateTime = new Date(`${reservation.slot.date}T${reservation.slot.startTime}`);
      return slotDateTime > new Date();
    }
    
    return true;
  };

  const getUpcomingReservations = () => {
    const now = new Date();
    return enrichedReservations
      .filter(r => {
        if (r.slot) {
          const slotDate = new Date(`${r.slot.date}T${r.slot.startTime}`);
          return slotDate > now && r.status !== 'CANCELLED';
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.slot.date}T${a.slot.startTime}`);
        const dateB = new Date(`${b.slot.date}T${b.slot.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your reservations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Reservations</h1>
              <p className="text-blue-100 mb-4 md:mb-0">
                Manage all your workspace bookings in one place
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/booking')}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
              <Button 
                onClick={() => navigate('/rooms')}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Browse Rooms
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
                </div>
                <CalendarDays className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalSpent} $</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Room name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter('all');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Reservations ({filteredReservations.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({getUpcomingReservations().length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No reservations found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                          ? "No reservations match your current filters"
                          : "You haven't made any reservations yet"
                        }
                      </p>
                      <Button onClick={() => navigate('/booking')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Make Your First Booking
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredReservations.map((reservation) => (
                        <motion.div
                          key={reservation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-6 hover:shadow-lg transition-all duration-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                {reservation.slot?.room?.name?.charAt(0) || 'R'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {reservation.slot?.room?.name || `Room #${reservation.slotId}`}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusIcon(reservation.status)}
                                  <Badge variant={getStatusColor(reservation.status)}>
                                    {reservation.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Reservation #{reservation.id}
                              </p>
                              <p className="text-xs text-gray-400">
                                Created {new Date(reservation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {reservation.slot && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatDate(reservation.slot.date)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatTime(reservation.slot.startTime)} - {formatTime(reservation.slot.endTime)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Team Size</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {reservation.teamSize} people
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {reservation.totalCost} $
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <div className="text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">Room Type: </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {reservation.slot.room.type.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 ml-4">Capacity: </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {reservation.slot.room.capacity} people
                                  </span>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="flex justify-end">
                            {canCancelReservation(reservation) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Cancel Reservation
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this reservation? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancel(reservation.id)}>
                                      Cancel Reservation
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  {getUpcomingReservations().length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No upcoming reservations
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Book a room to see your upcoming reservations here
                      </p>
                      <Button onClick={() => navigate('/booking')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Book a Room
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getUpcomingReservations().map((reservation) => (
                        <motion.div
                          key={reservation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-6 hover:shadow-lg transition-all duration-200 dark:border-gray-700 border-l-4 border-l-blue-500"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                {reservation.slot?.room?.name?.charAt(0) || 'R'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {reservation.slot?.room?.name || `Room #${reservation.slotId}`}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusIcon(reservation.status)}
                                  <Badge variant={getStatusColor(reservation.status)}>
                                    {reservation.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-blue-600">
                                    Upcoming
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Reservation #{reservation.id}
                              </p>
                              <p className="text-xs text-gray-400">
                                Created {new Date(reservation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {reservation.slot && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatDate(reservation.slot.date)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatTime(reservation.slot.startTime)} - {formatTime(reservation.slot.endTime)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Team Size</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {reservation.teamSize} people
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {reservation.totalCost} $
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <div className="text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">Room Type: </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {reservation.slot.room.type.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 ml-4">Capacity: </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {reservation.slot.room.capacity} people
                                  </span>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="flex justify-end">
                            {canCancelReservation(reservation) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Cancel Reservation
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this reservation? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancel(reservation.id)}>
                                      Cancel Reservation
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Booking Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</span>
                        <span className="font-semibold">{stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                        <span className="font-semibold text-green-600">
                          {stats.total > 0 ? Math.round(((stats.confirmed + stats.completed) / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Spent</span>
                        <span className="font-semibold">{stats.totalSpent} $</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Cost</span>
                        <span className="font-semibold">
                          {stats.total > 0 ? Math.round(stats.totalSpent / stats.total) : 0} $
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => navigate('/booking')}
                        className="w-full justify-start"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Make New Booking
                      </Button>
                      <Button 
                        onClick={() => navigate('/rooms')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Browse Available Rooms
                      </Button>
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default MyReservationsPage;