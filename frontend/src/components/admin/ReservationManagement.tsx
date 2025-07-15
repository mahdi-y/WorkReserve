/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reservationService, type Reservation } from '../../services/reservationService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  MoreHorizontal
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getAll();
      setReservations(data);
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
    let filtered = reservations;

    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.id.toString().includes(searchTerm) ||
        reservation.userId.toString().includes(searchTerm) ||
        reservation.slotId.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    setFilteredReservations(filtered);
  };

  const handleCancel = async (id: number) => {
    try {
      await reservationService.cancel(id);
      await loadReservations();
      toast({
        title: "Success",
        description: "Reservation cancelled successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const exportReservations = () => {
    const csvContent = [
      ['ID', 'Slot ID', 'User name', 'Team Size', 'Status', 'Created At'].join(','),
      ...filteredReservations.map(r => [
        r.id,
        r.slotId,
        r.userId,
        r.teamSize,
        r.status,
        new Date(r.createdAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reservationStats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{reservationStats.total}</div>
              <div className="text-sm text-blue-600">Total Reservations</div>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{reservationStats.confirmed}</div>
              <div className="text-sm text-green-600">Confirmed</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{reservationStats.completed}</div>
              <div className="text-sm text-purple-600">Completed</div>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{reservationStats.cancelled}</div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Reservation Management
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage and monitor all room reservations
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadReservations}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportReservations}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by ID, User ID, or Slot ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading reservations...</p>
                </div>
              </div>
            ) : filteredReservations.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredReservations.map((reservation, index) => (
                    <motion.div
                      key={reservation.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.05 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(reservation.status)}
                            <span className="font-medium text-lg">#{reservation.id}</span>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>Slot {reservation.slotId}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>User {reservation.userId}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{reservation.teamSize} people</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(reservation.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={getStatusVariant(reservation.status)}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(reservation.status)}
                            {reservation.status}
                          </Badge>
                          
                          <Dialog open={showDetailModal && selectedReservation?.id === reservation.id} onOpenChange={setShowDetailModal}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReservation(reservation)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Reservation Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information for reservation #{reservation.id}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedReservation && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium text-gray-500">Reservation ID</p>
                                      <p className="font-mono">#{selectedReservation.id}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-500">Status</p>
                                      <Badge variant={getStatusVariant(selectedReservation.status)}>
                                        {selectedReservation.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-500">Slot ID</p>
                                      <p>{selectedReservation.slotId}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-500">User ID</p>
                                      <p>{selectedReservation.userId}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-500">Team Size</p>
                                      <p>{selectedReservation.teamSize} people</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-500">Created</p>
                                      <p>{new Date(selectedReservation.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {reservation.status !== 'CANCELLED' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancel(reservation.id)}
                              className="flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No reservations found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'There are no reservations to display.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReservationManagement;