/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import MyReservations from '../../components/reservations/MyReservations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { reservationService } from '../../services/reservationService';
import { activityService } from '../../services/activityService';
import { useToast } from '../../hooks/use-toast';
import { 
  Calendar, 
  Building2, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Activity
} from 'lucide-react';

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

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    hoursBookedThisMonth: 0,
    favoriteRoomType: 'Conference Room'
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadReservations();
    loadRecentActivity();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getMine();
      setReservations(data);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const upcomingReservations = data.filter(r => {
        if (r.slot) {
          const slotDate = new Date(`${r.slot.date}T${r.slot.startTime}`);
          return slotDate > now && r.status !== 'CANCELLED';
        }
        return false;
      });
      
      const thisMonthReservations = data.filter(r => {
        if (r.slot) {
          const slotDate = new Date(r.slot.date);
          return slotDate.getMonth() === currentMonth && 
                 slotDate.getFullYear() === currentYear &&
                 r.status !== 'CANCELLED';
        }
        return false;
      });
      
      const totalHours = thisMonthReservations.reduce((acc, r) => {
        if (r.slot) {
          const start = new Date(`2000-01-01T${r.slot.startTime}`);
          const end = new Date(`2000-01-01T${r.slot.endTime}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return acc + hours;
        }
        return acc;
      }, 0);
      
      const calculateFavoriteRoomType = (reservations: any[]) => {
        const roomTypeCounts = reservations.reduce((acc, reservation) => {
          if (reservation.slot?.room?.type) {
            acc[reservation.slot.room.type] = (acc[reservation.slot.room.type] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);
  
        if (Object.keys(roomTypeCounts).length === 0) return 'None';
  
        const mostBookedType = Object.entries(roomTypeCounts).reduce((a, b) => 
          roomTypeCounts[a[0]] > roomTypeCounts[b[0]] ? a : b
        );
  
        return mostBookedType[0];
      };
  
      setStats({
        totalBookings: data.length,
        upcomingBookings: upcomingReservations.length,
        hoursBookedThisMonth: Math.round(totalHours),
        favoriteRoomType: calculateFavoriteRoomType(data)
      });
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast({
        title: "Error",
        description: "Failed to load your reservations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities = await activityService.getRecentActivity();
      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUpcomingReservations = () => {
    const now = new Date();
    return reservations
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
      })
      .slice(0, 3);
  };

  const formatReservationTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg shadow-lg p-6 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()}, {user?.fullName}! 👋
              </h1>
              <p className="text-blue-100 mb-4">
                Today is {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
              <p className="text-blue-100">
                Ready to book your workspace for today?
              </p>
            </div>
            <Button 
              onClick={() => navigate('/booking')}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Book
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hoursBookedThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {stats.hoursBookedThisMonth > 0 ? '+12% from last month' : 'Start booking!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Type</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sm">{stats.favoriteRoomType}</div>
              <p className="text-xs text-muted-foreground">Most booked</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reservations">My Reservations</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => navigate('/rooms')}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Browse Rooms
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/booking')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Make Booking
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/profile')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Profile Settings
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Reservations */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Upcoming Reservations</CardTitle>
                        <CardDescription>Your next bookings</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/reservations')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : getUpcomingReservations().length > 0 ? (
                      <div className="space-y-4">
                        {getUpcomingReservations().map((reservation) => (
                          <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {reservation.status === 'CONFIRMED' ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {reservation.slot?.room?.name || `Room #${reservation.slotId}`}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {reservation.slot && new Date(reservation.slot.date).toLocaleDateString()} • {reservation.slot && `${formatReservationTime(reservation.slot.startTime)} - ${formatReservationTime(reservation.slot.endTime)}`}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={reservation.status === 'CONFIRMED' ? 'default' : 'secondary'}
                            >
                              {reservation.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No upcoming reservations</p>
                        <Button className="mt-4" onClick={() => navigate('/booking')}>
                          Book Your First Room
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reservations">
              <MyReservations />
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white">{activity.action}</p>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default DashboardPage;