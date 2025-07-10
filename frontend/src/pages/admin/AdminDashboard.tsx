/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import UserManagement from '../../components/admin/UserManagement';
import RoomManagement from '../../components/admin/RoomManagement';
import TimeSlotManagement from '../../components/admin/TimeSlotManagement';
import ReservationManagement from '../../components/admin/ReservationManagement';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react';
import { adminService, type SystemActivity } from '../../services/adminService';

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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRooms: 0,
    totalReservations: 0,
    monthlyGrowth: 0,
    revenue: 0
  });
  const [systemActivities, setSystemActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [stats, activities] = await Promise.all([
          adminService.getAdminStats(),
          adminService.getRecentSystemActivity()
        ]);
        
        setAdminStats(stats);
        setSystemActivities(activities);
      } catch (error) {
        console.error('Failed to load admin data:', error);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [toast]);

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'USER':
        return 'bg-green-600';
      case 'RESERVATION':
        return 'bg-blue-600';
      case 'ROOM':
        return 'bg-orange-600';
      case 'ROLE':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getActivityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'USER':
        return 'User';
      case 'RESERVATION':
        return 'Booking';
      case 'ROOM':
        return 'Room';
      case 'ROLE':
        return 'Role';
      default:
        return 'System';
    }
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
          className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 rounded-lg shadow-lg p-6 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-blue-100 mb-4">
                Manage users, rooms, and monitor system activity
              </p>
              <p className="text-blue-100">
                Welcome back, {user.fullName}! 👨‍💼
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">System Status</p>
              <Badge className="bg-green-500 text-white">All Systems Operational</Badge>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{adminStats.monthlyGrowth.toFixed(1)}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {adminStats.totalUsers - adminStats.activeUsers} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">Across all locations</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalReservations}</div>
              <p className="text-xs text-muted-foreground">Current bookings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="rooms">Room Management</TabsTrigger>
              <TabsTrigger value="timeslots">Time Slots Management</TabsTrigger>
              <TabsTrigger value="reservations">Reservations Management</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent System Activity
                    </CardTitle>
                    <CardDescription>Latest user and room activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : systemActivities.length > 0 ? (
                      <div className="space-y-4">
                        {systemActivities.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3 text-sm">
                            <div className="flex-shrink-0">
                              <div className={`w-2 h-2 rounded-full ${getActivityIcon(activity.entityType)}`}></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-white">{activity.action}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {getActivityTypeLabel(activity.entityType)}
                                {activity.entityName && ` • ${activity.entityName}`}
                              </p>
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {activity.timeAgo}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('rooms')}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Manage Rooms
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('reservations')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Reservations
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('timeslots')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Manage Time Slots
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('users')}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      User Management
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="rooms">
              <RoomManagement />
            </TabsContent>

            <TabsContent value="timeslots" className="space-y-6">
              <TimeSlotManagement />
            </TabsContent>

            <TabsContent value="reservations">
              <ReservationManagement />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default AdminDashboard;