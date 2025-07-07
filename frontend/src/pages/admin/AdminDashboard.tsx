import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import UserManagement from '../../components/admin/UserManagement';
import RoomManagement from '../../components/admin/RoomManagement';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp,
  UserCheck,
  UserX,
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

// Mock admin stats
const mockAdminStats = {
  totalUsers: 156,
  activeUsers: 142,
  totalRooms: 24,
  activeReservations: 38,
  monthlyGrowth: 12.5,
  revenueThisMonth: 4250
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
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
              <div className="text-2xl font-bold">{mockAdminStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{mockAdminStats.monthlyGrowth}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAdminStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {mockAdminStats.totalUsers - mockAdminStats.activeUsers} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAdminStats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">Across all locations</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAdminStats.activeReservations}</div>
              <p className="text-xs text-muted-foreground">Current bookings</p>
            </CardContent>
          </Card>

        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="rooms">Room Management</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent System Activity</CardTitle>
                    <CardDescription>Latest user and room activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: 'New user registered: john.doe@email.com', time: '5 min ago', type: 'user' },
                        { action: 'Room "Conference A" was booked', time: '15 min ago', type: 'booking' },
                        { action: 'User role updated: jane.smith@email.com → ADMIN', time: '1 hour ago', type: 'role' },
                        { action: 'New room created: "Hot Desk #25"', time: '2 hours ago', type: 'room' },
                        { action: 'Booking cancelled: Meeting Room B', time: '3 hours ago', type: 'cancellation' },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'user' ? 'bg-green-600' :
                              activity.type === 'booking' ? 'bg-blue-600' :
                              activity.type === 'role' ? 'bg-purple-600' :
                              activity.type === 'room' ? 'bg-orange-600' :
                              'bg-red-600'
                            }`}></div>
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
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Reservations
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      System Analytics
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('users')}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Deactivate User
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
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default AdminDashboard;