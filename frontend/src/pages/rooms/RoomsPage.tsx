/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import RoomCard from '../../components/rooms/RoomCard';
import RoomFiltersComponent from '../../components/rooms/RoomFilters';
import { Button } from '../../components/ui/button';
import { Search, Filter } from 'lucide-react';
import { roomService, type Room, type RoomFilters } from '../../services/roomService';
import { useToast } from '../../hooks/use-toast';

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

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    const hasTimeFilters = filters.date && filters.startTime && filters.endTime;
    
    if (hasTimeFilters) {
      try {
        setSearchLoading(true);
        let availableRooms = await roomService.getAvailableRooms(
          filters.date!, 
          filters.startTime!, 
          filters.endTime!
        );

        if (filters.type && filters.type !== 'ALL') {
          availableRooms = availableRooms.filter(room => room.type === filters.type);
        }
        if (filters.capacity) {
          availableRooms = availableRooms.filter(room => room.capacity >= filters.capacity!);
        }

        setRooms(availableRooms);
      } catch (error) {
        console.error('Failed to search rooms:', error);
        toast({
          title: "Search Error",
          description: "Failed to search available rooms. Please try again.",
          variant: "destructive"
        });
      } finally {
        setSearchLoading(false);
      }
    } else {
      try {
        setSearchLoading(true);
        const allRooms = await roomService.getAllRooms();
        let filteredRooms = allRooms;

        if (filters.type && filters.type !== 'ALL') {
          filteredRooms = filteredRooms.filter(room => room.type === filters.type);
        }
        if (filters.capacity) {
          filteredRooms = filteredRooms.filter(room => room.capacity >= filters.capacity!);
        }

        setRooms(filteredRooms);
      } catch (error) {
        console.error('Failed to filter rooms:', error);
        toast({
          title: "Filter Error",
          description: "Failed to filter rooms. Please try again.",
          variant: "destructive"
        });
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    loadRooms();
  };

  const handleBookRoom = (room: Room) => {
    navigate(`/booking`, { state: { room, filters } });
  };

  const handleViewDetails = (room: Room) => {
    navigate(`/rooms/${room.id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading rooms...</p>
          </motion.div>
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
        className="space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Discover Your Perfect Workspace
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Browse {rooms.length} available rooms and find the ideal space for your needs
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2 bg-white dark:bg-gray-800"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
        </motion.div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <RoomFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              loading={searchLoading}
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="min-h-[600px]">
          {searchLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Search className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-300">Searching rooms...</p>
              </div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  No rooms found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                  No rooms match your current search criteria. Try adjusting your filters.
                </p>
                <Button 
                  onClick={handleClearFilters}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  variants={itemVariants}
                >
                  <RoomCard
                    room={room}
                    onBook={handleBookRoom}
                    onViewDetails={handleViewDetails}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default RoomsPage;