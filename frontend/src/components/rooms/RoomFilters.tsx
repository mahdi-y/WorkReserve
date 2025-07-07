import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Calendar, Clock, Users, Filter } from 'lucide-react';
import type { RoomFilters } from '../../services/roomService';

interface RoomFiltersProps {
  filters: RoomFilters;
  onFiltersChange: (filters: RoomFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const RoomFiltersComponent: React.FC<RoomFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading = false
}) => {
  const handleFilterChange = (key: keyof RoomFilters, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Rooms</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Room Type
          </Label>
          <Select 
            value={filters.type || 'ALL'} 
            onValueChange={(value) => handleFilterChange('type', value === 'ALL' ? '' : value)}
          >
            <SelectTrigger className="h-11 dark:bg-gray-700 dark:border-gray-600">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="HOT_DESK">Hot Desk</SelectItem>
              <SelectItem value="DEDICATED_DESK">Dedicated Desk</SelectItem>
              <SelectItem value="CONFERENCE_ROOM">Conference Room</SelectItem>
              <SelectItem value="PRIVATE_OFFICE">Private Office</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Min. Capacity
          </Label>
          <Input
            id="capacity"
            type="number"
            placeholder="e.g. 4"
            min="1"
            value={filters.capacity || ''}
            onChange={(e) => handleFilterChange('capacity', parseInt(e.target.value) || '')}
            className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
          </Label>
          <Input
            id="date"
            type="date"
            min={today}
            value={filters.date || ''}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Start Time
          </Label>
          <Input
            id="startTime"
            type="time"
            value={filters.startTime || ''}
            onChange={(e) => handleFilterChange('startTime', e.target.value)}
            className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            End Time
          </Label>
          <Input
            id="endTime"
            type="time"
            value={filters.endTime || ''}
            onChange={(e) => handleFilterChange('endTime', e.target.value)}
            className="h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Button 
          onClick={onApplyFilters} 
          className="px-8 h-11 bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Apply Filters'}
        </Button>
        <Button 
          onClick={onClearFilters} 
          variant="outline"
          className="px-8 h-11"
          disabled={loading}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default RoomFiltersComponent;