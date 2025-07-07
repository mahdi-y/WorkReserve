/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Building2, Layout, Users2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Room } from '../../services/roomService';

interface RoomCardProps {
  room: Room;
  onBook?: (room: Room) => void;
  onViewDetails?: (room: Room) => void;
  showActions?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onBook, 
  onViewDetails, 
  showActions = true 
}) => {

  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const roomImages = room.imageUrls && room.imageUrls.length > 0 
    ? room.imageUrls 
    : [`https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=256&fit=crop&auto=format`];

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
      case 'HOT_DESK': return <Layout className="w-4 h-4" />;
      case 'DEDICATED_DESK': return <Layout className="w-4 h-4" />;
      case 'CONFERENCE_ROOM': return <Users2 className="w-4 h-4" />;
      case 'PRIVATE_OFFICE': return <Building2 className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const formatRoomType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const getCurrentImageUrl = () => {
    const currentImage = roomImages[currentImageIndex];
    
    if (imageErrors.has(currentImageIndex)) {
      return `https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=256&fit=crop&auto=format`;
    }
    
    return currentImage;
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col overflow-hidden">
      <div className="relative h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="flex h-full"
          animate={{ x: `-${currentImageIndex * 100}%` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          {roomImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${room.name} - Image ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=256&fit=crop&auto=format`;
              }}
            />
          ))}
        </motion.div>

        {roomImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {roomImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
            {roomImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge className={`${getTypeColor(room.type)} px-3 py-1.5 shadow-md`}>
            <div className="flex items-center gap-1.5">
              {getTypeIcon(room.type)}
              <span className="font-medium text-sm">{formatRoomType(room.type)}</span>
            </div>
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge className="bg-green-600 text-white px-3 py-1.5 shadow-md">
            <span className="font-semibold">{room.pricePerHour} TND/h</span>
          </Badge>
        </div>

        {room.imageUrls && room.imageUrls.length > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/50 text-white px-2 py-1 text-xs">
              {currentImageIndex + 1}/{roomImages.length}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {room.name}
        </CardTitle>
        
        <CardDescription className="dark:text-gray-300 text-base leading-relaxed line-clamp-2">
          {room.description || 'A professional workspace designed for productivity and comfort.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                  <p className="font-semibold text-lg">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Features:</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                WiFi
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Power Outlets
              </span>
              {room.type === 'CONFERENCE_ROOM' && (
                <>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    Projector
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                    Whiteboard
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
            <Button 
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 font-medium text-base" 
              onClick={() => onBook?.(room)}
            >
              Book Now
            </Button>
            <Button 
              variant="outline" 
              className="h-12 px-6 font-medium text-base border-gray-300 dark:border-gray-600"
              onClick={() => onViewDetails?.(room)}
            >
              Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomCard;