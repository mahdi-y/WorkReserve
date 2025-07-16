/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Activity,
  BarChart3,
  PieChart,
  Clock,
  RefreshCw
} from 'lucide-react';
import { adminService, type SystemActivity } from '../../services/adminService';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie
} from 'recharts';

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
  const [chartDataLoading, setChartDataLoading] = useState(true);

  const [chartData, setChartData] = useState({
    monthlyReservations: [] as any[],
    roomUsage: [] as any[],
    userGrowth: [] as any[],
    dailyActivity: [] as any[],
    weeklyRevenue: [] as any[]
  });

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

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setChartDataLoading(true);
        const [monthlyData, roomData, userGrowthData, activityData, weeklyRevenueData] = await Promise.all([
          adminService.getMonthlyStats(),
          adminService.getRoomUsageStats(),
          adminService.getUserGrowthStats(),
          adminService.getDailyActivityStats(),
          adminService.getWeeklyRevenueStats()
        ]);
        
        setChartData({
          monthlyReservations: monthlyData,
          roomUsage: roomData,
          userGrowth: userGrowthData,
          dailyActivity: activityData,
          weeklyRevenue: weeklyRevenueData
        });
      } catch (error) {
        console.error('Failed to load chart data:', error);
        toast({
          title: "Warning",
          description: "Failed to load analytics data. Using sample data.",
          variant: "destructive"
        });
        
        setChartData({
          monthlyReservations: [
            { month: 'Jan', reservations: 45, revenue: 2250 },
            { month: 'Feb', reservations: 52, revenue: 2600 },
            { month: 'Mar', reservations: 48, revenue: 2400 },
            { month: 'Apr', reservations: 61, revenue: 3050 },
            { month: 'May', reservations: 55, revenue: 2750 },
            { month: 'Jun', reservations: 67, revenue: 3350 },
          ],
          roomUsage: [
            { name: 'Conference Rooms', value: 35, color: '#8884d8' },
            { name: 'Hot Desks', value: 25, color: '#82ca9d' },
            { name: 'Private Offices', value: 20, color: '#ffc658' },
            { name: 'Dedicated Desks', value: 20, color: '#ff7300' },
          ],
          userGrowth: [
            { month: 'Jan', users: 120 },
            { month: 'Feb', users: 135 },
            { month: 'Mar', users: 149 },
            { month: 'Apr', users: 162 },
            { month: 'May', users: 178 },
            { month: 'Jun', users: 195 },
          ],
          dailyActivity: [
            { hour: '08:00', bookings: 5 },
            { hour: '09:00', bookings: 12 },
            { hour: '10:00', bookings: 18 },
            { hour: '11:00', bookings: 22 },
            { hour: '12:00', bookings: 15 },
            { hour: '13:00', bookings: 8 },
            { hour: '14:00', bookings: 20 },
            { hour: '15:00', bookings: 25 },
            { hour: '16:00', bookings: 18 },
            { hour: '17:00', bookings: 12 },
          ],
          weeklyRevenue: [
            { day: 'Mon', revenue: 450 },
            { day: 'Tue', revenue: 380 },
            { day: 'Wed', revenue: 520 },
            { day: 'Thu', revenue: 480 },
            { day: 'Fri', revenue: 650 },
            { day: 'Sat', revenue: 320 },
            { day: 'Sun', revenue: 280 },
          ]
        });
      } finally {
        setChartDataLoading(false);
      }
    };
    
    loadChartData();
  }, [toast]);

  const refreshData = async () => {
    setLoading(true);
    setChartDataLoading(true);
    
    try {
      const [stats, activities, monthlyData, roomData, userGrowthData, activityData, weeklyRevenueData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getRecentSystemActivity(),
        adminService.getMonthlyStats(),
        adminService.getRoomUsageStats(),
        adminService.getUserGrowthStats(),
        adminService.getDailyActivityStats(),
        adminService.getWeeklyRevenueStats()
      ]);
      
      setAdminStats(stats);
      setSystemActivities(activities);
      setChartData({
        monthlyReservations: monthlyData,
        roomUsage: roomData,
        userGrowth: userGrowthData,
        dailyActivity: activityData,
        weeklyRevenue: weeklyRevenueData
      });

      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setChartDataLoading(false);
    }
  };

  const HeaderWithRefresh = () => (
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
        <div className="text-right space-y-2">
          <div>
            <p className="text-blue-100 text-sm">System Status</p>
            <Badge className="bg-green-500 text-white">All Systems Operational</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading || chartDataLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || chartDataLoading) ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const ChartLoadingSpinner = () => (
    <div className="flex items-center justify-center h-[300px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading chart data...</p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 shadow text-xs">
          <div className="font-semibold mb-1">{label}</div>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              ></span>
              <span>{entry.name}:</span>
              <span className="font-mono">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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
        <HeaderWithRefresh />

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
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
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.revenue.toFixed(2)} DT</div>
                  <p className="text-xs text-muted-foreground">Current month earnings</p>
                </CardContent>
              </Card>
            </>
          )}
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
                      <BarChart3 className="w-5 h-5" />
                      Monthly Performance
                    </CardTitle>
                    <CardDescription>Reservations and revenue trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartDataLoading ? (
                      <ChartLoadingSpinner />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.monthlyReservations}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="reservations"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                            name="Reservations"
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            stackId="2"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            fillOpacity={0.6}
                            name="Revenue (DT)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Room Usage Distribution
                    </CardTitle>
                    <CardDescription>Breakdown by room type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={chartData.roomUsage}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {chartData.roomUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      User Growth
                    </CardTitle>
                    <CardDescription>User registration over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#8884d8"
                          strokeWidth={3}
                          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                          name="Total Users"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Daily Activity Pattern
                    </CardTitle>
                    <CardDescription>Booking activity by hour</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="bookings"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                          name="Bookings"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Weekly Revenue Breakdown
                  </CardTitle>
                  <CardDescription>Revenue generated per day this week in DT</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.weeklyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value) => [`${value}`, 'Revenue']}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                        name="Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

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