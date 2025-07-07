import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Building2, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';

// Mock data - replace with actual API calls later
const mockStats = {
  totalBookings: 12,
  upcomingBookings: 3,
  hoursBookedThisMonth: 45,
  favoriteRoomType: 'Conference Room'
};

const mockUpcomingReservations = [
  {
    id: 1,
    roomName: 'Conference Room A',
    date: '2025-07-06',
    time: '10:00 - 12:00',
    status: 'confirmed'
  },
  {
    id: 2,
    roomName: 'Hot Desk #12',
    date: '2025-07-07',
    time: '09:00 - 17:00',
    status: 'pending'
  },
  {
    id: 3,
    roomName: 'Private Office 3',
    date: '2025-07-08',
    time: '14:00 - 16:00',
    status: 'confirmed'
  }
];

const mockRecentActivity = [
  { action: 'Booked Conference Room A', time: '2 hours ago', type: 'booking' },
  { action: 'Cancelled Hot Desk #5', time: '1 day ago', type: 'cancellation' },
  { action: 'Updated profile information', time: '3 days ago', type: 'profile' },
  { action: 'Booked Private Office 2', time: '5 days ago', type: 'booking' },
];

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
              <div className="text-2xl font-bold">{mockStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.hoursBookedThisMonth}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Type</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sm">{mockStats.favoriteRoomType}</div>
              <p className="text-xs text-muted-foreground">Most booked</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
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
                onClick={() => navigate('/reservations')}
              >
                <Clock className="w-4 h-4 mr-2" />
                My Reservations
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

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Upcoming Reservations</CardTitle>
                  <CardDescription>Your next bookings</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/reservations">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mockUpcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {mockUpcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {reservation.status === 'confirmed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {reservation.roomName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {reservation.date} • {reservation.time}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
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
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
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
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default DashboardPage;