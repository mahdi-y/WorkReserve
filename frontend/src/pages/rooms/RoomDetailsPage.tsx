import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Users, Calendar, ChevronLeft, ChevronRight, Building2, Layout as LayoutIcon, Users2 } from 'lucide-react';
import { roomService, type Room } from '../../services/roomService';
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

const RoomDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadRoom = async (roomId: number) => {
      try {
        setLoading(true);
        const roomData = await roomService.getRoomById(roomId);
        setRoom(roomData);
      } catch (error) {
        console.error('Failed to load room:', error);
        toast({
          title: "Error",
          description: "Failed to load room details. Please try again.",
          variant: "destructive"
        });
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRoom(parseInt(id));
    }
  }, [id, navigate, toast]);

  const handleBookRoom = () => {
    if (room) {
      navigate('/booking', { state: { room } });
    }
  };

  const formatRoomType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'HOT_DESK': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DEDICATED_DESK': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CONFERENCE_ROOM': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'PRIVATE_OFFICE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOT_DESK': return <LayoutIcon className="w-4 h-4" />;
      case 'DEDICATED_DESK': return <LayoutIcon className="w-4 h-4" />;
      case 'CONFERENCE_ROOM': return <Users2 className="w-4 h-4" />;
      case 'PRIVATE_OFFICE': return <Building2 className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  // Use actual DB images or fallback
  const roomImages = room && room.imageUrls && room.imageUrls.length > 0
    ? room.imageUrls
    : [`https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=384&fit=crop&auto=format`];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
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
            <p className="text-gray-600 dark:text-gray-300">Loading room details...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-600 dark:text-gray-300">Room not found</p>
            <Button onClick={() => navigate('/rooms')} className="mt-4">
              Back to Rooms
            </Button>
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
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/rooms')}
            className="dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
              <div className="relative h-96 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="flex h-full"
                  animate={{ x: `-${currentImageIndex * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                >
                  {roomImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${room?.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=384&fit=crop&auto=format`;
                      }}
                    />
                  ))}
                </motion.div>

                {roomImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className="absolute top-4 left-4">
                  <Badge className={`${getTypeColor(room!.type)} px-4 py-2 shadow-lg`}>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(room!.type)}
                      <span className="font-medium">{formatRoomType(room!.type)}</span>
                    </div>
                  </Badge>
                </div>

                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-600 text-white px-4 py-2 shadow-lg">
                    <span className="font-semibold text-lg">{room!.pricePerHour} TND/h</span>
                  </Badge>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {roomImages.length}
                </div>
              </div>

              {roomImages.length > 1 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex space-x-2 overflow-x-auto">
                    {roomImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'border-blue-500' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://images.unsplash.com/photo-1497366216548-37526070297c?w=64&h=64&fit=crop&auto=format`;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    {room.description || 'This is a professional workspace designed for productivity and comfort. Perfect for teams and individuals looking for a high-quality work environment with modern amenities.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium dark:text-white text-lg">Capacity</p>
                      <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold">
                        {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <p className="font-medium dark:text-white text-lg">Price</p>
                      <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold">{room.pricePerHour} TND/hour</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Room Features & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {room.type === 'CONFERENCE_ROOM' && (
                      <>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="font-medium">Projector & Screen</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="font-medium">Whiteboard</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="font-medium">Video Conferencing</span>
                        </div>
                      </>
                    )}
                    {room.type === 'PRIVATE_OFFICE' && (
                      <>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="font-medium">Private Space</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="font-medium">Lockable Door</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="font-medium">Personal Storage</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="font-medium">High-Speed WiFi</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="font-medium">Power Outlets</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="font-medium">Air Conditioning</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="font-medium">Natural Lighting</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="sticky top-8 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white text-xl">Book This Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {room.pricePerHour} TND
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">per hour</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                    <span className="font-medium dark:text-white">
                      {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Room Type</span>
                    <span className="font-medium dark:text-white">{formatRoomType(room.type)}</span>
                  </div>
                  
                </div>

                <Button 
                  onClick={handleBookRoom}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>

                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Free cancellation up to 24 hours
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Instant booking confirmation
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    24/7 customer support
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default RoomDetailsPage;