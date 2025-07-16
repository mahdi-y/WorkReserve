/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';
import {
  Clock,
  Search,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Table as TableIcon,
  CalendarDays
} from 'lucide-react';
import { timeSlotService, type TimeSlot, type TimeSlotRequest } from '../../services/timeSlotService';
import { roomService, type Room } from '../../services/roomService';


const localizer = momentLocalizer(moment);

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

const calendarStyles = `
  .rbc-calendar {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .dark .rbc-calendar {
    background: rgb(17 24 39);
    color: rgb(243 244 246);
  }
  
  .rbc-event.available-slot {
    background-color: #10b981;
    border-color: #059669;
    color: white;
  }
  
  .rbc-event.booked-slot {
    background-color: #ef4444;
    border-color: #dc2626;
    color: white;
  }
  
  .rbc-event:hover {
    opacity: 0.8;
    cursor: pointer;
  }
  
  .rbc-time-slot:hover {
    cursor: crosshair;
    background-color: rgba(59, 130, 246, 0.05) !important;
  }
  
  .rbc-day-slot:hover {
    cursor: crosshair;
    background-color: rgba(59, 130, 246, 0.05) !important;
  }
  
  .rbc-date-cell:hover {
    cursor: crosshair;
    background-color: rgba(59, 130, 246, 0.02) !important;
  }
  
  .rbc-month-view .rbc-date-cell:hover {
    cursor: copy;
    background-color: rgba(59, 130, 246, 0.05) !important;
  }
  
  .rbc-time-slot::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    opacity: 0;
  }
  
  .rbc-time-slot:hover::after {
    opacity: 1;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  }
  
  .rbc-header {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    padding: 8px 4px;
  }
  
  .dark .rbc-header {
    background-color: rgb(30 41 59);
    border-bottom-color: rgb(51 65 85);
    color: rgb(203 213 225);
  }
  
  .rbc-time-slot {
    border-top: 1px solid #f1f5f9;
    position: relative;
  }
  
  .dark .rbc-time-slot {
    border-top-color: rgb(51 65 85);
  }
  
  .dark .rbc-time-slot:hover {
    background-color: rgba(59, 130, 246, 0.08) !important;
  }
  
  .rbc-today {
    background-color: #fef3c7;
  }
  
  .dark .rbc-today {
    background-color: rgb(69 26 3);
  }
  
  .rbc-off-range-bg {
    background-color: #f8fafc;
  }
  
  .dark .rbc-off-range-bg {
    background-color: rgb(15 23 42);
  }
  
  .rbc-toolbar {
    display: none; 
  }
`;

const TimeSlotManagement: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TimeSlotRequest>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [bulkFormData, setBulkFormData] = useState({
    startDate: '',
    endDate: '',
    roomId: '',
    timeSlots: [{ startTime: '', endTime: '' }],
    repeatWeekly: false,
    weekDays: [] as number[],
    skipWeekends: false,
    skipHolidays: false
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [calendarView, setCalendarView] = useState<any>(Views.WEEK);

  const [calendarDate, setCalendarDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedTimeSlots, setPaginatedTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTimeSlots();
  }, [timeSlots, searchTerm, dateFilter, roomFilter, statusFilter]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedTimeSlots(filteredTimeSlots.slice(startIndex, endIndex));
  }, [filteredTimeSlots, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTimeSlots.length / itemsPerPage);
  const totalItems = filteredTimeSlots.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedSlots([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
    setSelectedSlots([]);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [timeSlotsData, roomsData] = await Promise.all([
        timeSlotService.getAllTimeSlots(),
        roomService.getAllRooms()
      ]);
      setTimeSlots(timeSlotsData);
      setRooms(roomsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTimeSlots = () => {
    let filtered = timeSlots;

    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.room.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter && dateFilter.trim() !== '') {
      filtered = filtered.filter(slot => slot.date === dateFilter);
    }

    if (roomFilter !== 'all') {
      filtered = filtered.filter(slot => slot.room.id.toString() === roomFilter);
    }

    if (statusFilter !== 'all') {
      const isAvailable = statusFilter === 'available';
      filtered = filtered.filter(slot => slot.available === isAvailable);
    }

    setFilteredTimeSlots(filtered);
  };

  const handleCreateTimeSlot = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.roomId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newTimeSlot = await timeSlotService.createTimeSlot(formData as TimeSlotRequest);
      setTimeSlots(prev => [...prev, newTimeSlot]);
      setFormData({});
      setIsCreateDialogOpen(false);

      toast({
        title: "Time Slot Created",
        description: "Time slot has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create time slot",
        variant: "destructive"
      });
    }
  };

  const handleEditTimeSlot = async () => {
    if (!selectedTimeSlot || !formData.date || !formData.startTime || !formData.endTime || !formData.roomId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedTimeSlot = await timeSlotService.updateTimeSlot(
        selectedTimeSlot.id,
        formData as TimeSlotRequest
      );
      setTimeSlots(prev => prev.map(slot =>
        slot.id === selectedTimeSlot.id ? updatedTimeSlot : slot
      ));
      setFormData({});
      setSelectedTimeSlot(null);
      setIsEditDialogOpen(false);

      toast({
        title: "Time Slot Updated",
        description: "Time slot has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update time slot",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId: number) => {
    try {
      await timeSlotService.deleteTimeSlot(timeSlotId);
      setTimeSlots(prev => prev.filter(slot => slot.id !== timeSlotId));

      toast({
        title: "Time Slot Deleted",
        description: "Time slot has been removed from the system.",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete time slot",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setFormData({
      date: timeSlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      roomId: timeSlot.room.id,
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({});
    setIsCreateDialogOpen(true);
  };

  const addTimeSlot = () => {
    setBulkFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '', endTime: '' }]
    }));
  };

  const removeTimeSlot = (index: number) => {
    setBulkFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setBulkFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleWeekDay = (day: number) => {
    setBulkFormData(prev => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter(d => d !== day)
        : [...prev.weekDays, day]
    }));
  };

  const handleBulkCreate = async () => {
    if (!bulkFormData.startDate || !bulkFormData.endDate || !bulkFormData.roomId ||
      bulkFormData.timeSlots.some(slot => !slot.startTime || !slot.endTime)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const bulkRequest = await timeSlotService.createBulkTimeSlots({
        startDate: bulkFormData.startDate,
        endDate: bulkFormData.endDate,
        roomId: parseInt(bulkFormData.roomId),
        timeSlots: bulkFormData.timeSlots,
        repeatWeekly: bulkFormData.repeatWeekly,
        weekDays: bulkFormData.weekDays,
        skipWeekends: bulkFormData.skipWeekends,
        skipHolidays: bulkFormData.skipHolidays
      });

      await loadData();
      setBulkFormData({
        startDate: '',
        endDate: '',
        roomId: '',
        timeSlots: [{ startTime: '', endTime: '' }],
        repeatWeekly: false,
        weekDays: [],
        skipWeekends: false,
        skipHolidays: false
      });
      setIsBulkCreateDialogOpen(false);

      toast({
        title: "Bulk Time Slots Created",
        description: `Successfully created ${bulkRequest.length} time slots.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create bulk time slots",
        variant: "destructive"
      });
    }
  };

  const openBulkCreateDialog = () => {
    setBulkFormData({
      startDate: '',
      endDate: '',
      roomId: '',
      timeSlots: [{ startTime: '', endTime: '' }],
      repeatWeekly: false,
      weekDays: [],
      skipWeekends: false,
      skipHolidays: false
    });
    setIsBulkCreateDialogOpen(true);
  };

  const loadTemplates = async () => {
    try {
      const templateData = await timeSlotService.getTemplates();
      setTemplates(templateData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for the template.",
        variant: "destructive"
      });
      return;
    }

    try {
      await timeSlotService.saveTemplate({
        name: templateName,
        timeSlots: bulkFormData.timeSlots.filter(slot => slot.startTime && slot.endTime),
        settings: {
          repeatWeekly: bulkFormData.repeatWeekly,
          weekDays: bulkFormData.weekDays,
          skipWeekends: bulkFormData.skipWeekends
        }
      });

      await loadTemplates();
      setTemplateName('');
      toast({
        title: "Template Saved",
        description: "Template has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const convertTimeSlotsToEvents = () => {
    const events = filteredTimeSlots.map(slot => {
      const startDateTime = moment(`${slot.date} ${slot.startTime}`).toDate();
      const endDateTime = moment(`${slot.date} ${slot.endTime}`).toDate();

      return {
        id: slot.id,
        title: `${slot.room.name}`,
        start: startDateTime,
        end: endDateTime,
        resource: slot,
        className: slot.available ? 'available-slot' : 'booked-slot'
      };
    });

    setCalendarEvents(events);
  };

  useEffect(() => {
    convertTimeSlotsToEvents();
  }, [filteredTimeSlots]);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    openEditDialog(event.resource);
  };

  const handleSelectSlot = (slotInfo: any) => {
    const newFormData = {
      date: moment(slotInfo.start).format('YYYY-MM-DD'),
      startTime: moment(slotInfo.start).format('HH:mm'),
      endTime: moment(slotInfo.end).format('HH:mm'),
    };
    setFormData(newFormData);
    setIsCreateDialogOpen(true);
  };

  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    const navigate = (action: string) => {
      const currentDate = calendarDate || new Date();
      let newDate = new Date(currentDate);

      switch (action) {
        case 'PREV':
          if (calendarView === Views.DAY) {
            newDate.setDate(newDate.getDate() - 1);
          } else if (calendarView === Views.WEEK) {
            newDate.setDate(newDate.getDate() - 7);
          } else if (calendarView === Views.MONTH) {
            newDate.setMonth(newDate.getMonth() - 1);
          }
          break;
        case 'NEXT':
          if (calendarView === Views.DAY) {
            newDate.setDate(newDate.getDate() + 1);
          } else if (calendarView === Views.WEEK) {
            newDate.setDate(newDate.getDate() + 7);
          } else if (calendarView === Views.MONTH) {
            newDate.setMonth(newDate.getMonth() + 1);
          }
          break;
        case 'TODAY':
          newDate = new Date();
          break;
      }

      setCalendarDate(newDate);
      onNavigate(action);
    };

    return (
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('PREV')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('TODAY')}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('NEXT')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-lg font-semibold">{label}</h3>

        <div className="flex gap-1">
          <Button
            variant={calendarView === Views.DAY ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCalendarView(Views.DAY);
              onView(Views.DAY);
            }}
          >
            Day
          </Button>
          <Button
            variant={calendarView === Views.WEEK ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCalendarView(Views.WEEK);
              onView(Views.WEEK);
            }}
          >
            Week
          </Button>
          <Button
            variant={calendarView === Views.MONTH ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCalendarView(Views.MONTH);
              onView(Views.MONTH);
            }}
          >
            Month
          </Button>
        </div>
      </div>
    );
  };

  const CustomEvent = ({ event }: any) => {
    const isMonthView = calendarView === Views.MONTH;

    if (isMonthView) {
      return (
        <div className="text-xs p-1 truncate">
          <div className="flex items-center justify-between">
            <span className="truncate">{event.title}</span>
            <div className={`w-2 h-2 rounded-full ${event.resource.available ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-1">
        <div className="font-medium text-xs">{event.title}</div>
        <div className="text-xs opacity-75">
          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </div>
        <div className="text-xs">
          <Badge
            variant={event.resource.available ? "default" : "destructive"}
            className="text-xs"
          >
            {event.resource.available ? "Available" : "Booked"}
          </Badge>
        </div>
      </div>
    );
  };

  useEffect(() => {
    console.log('Calendar Date changed:', calendarDate);
    console.log('Date Filter:', dateFilter);
    console.log('Filtered TimeSlots count:', filteredTimeSlots.length);
    console.log('Calendar Events count:', calendarEvents.length);
  }, [calendarDate, dateFilter, filteredTimeSlots, calendarEvents]);

  const toggleSelectAll = () => {
    const currentPageIds = paginatedTimeSlots.map(slot => slot.id);
    const allCurrentPageSelected = currentPageIds.every(id => selectedSlots.includes(id));

    if (allCurrentPageSelected) {
      setSelectedSlots(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedSlots(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const toggleSelectSlot = (slotId: number) => {
    setSelectedSlots(prev =>
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const PaginationComponent = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push('...');
        }

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (end < totalPages) {
          if (end < totalPages - 1) pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Rows per page:</Label>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} time slots
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    );
  };

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Slot Management
              </CardTitle>
              <CardDescription>Manage available time slots for room bookings</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={openCreateDialog} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Single Slot
              </Button>
              <Button onClick={openBulkCreateDialog}>
                <Calendar className="w-4 h-4 mr-2" />
                Bulk Create
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by room name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
            />

            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setRoomFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="w-4 h-4 mr-2" />
              Table View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{timeSlots.length}</div>
              <div className="text-sm text-blue-600">Total Time Slots</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {timeSlots.filter(slot => slot.available).length}
              </div>
              <div className="text-sm text-green-600">Available</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {timeSlots.filter(slot => !slot.available).length}
              </div>
              <div className="text-sm text-red-600">Booked</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(timeSlots.map(slot => slot.room.id)).size}
              </div>
              <div className="text-sm text-purple-600">Rooms with Slots</div>
            </div>
          </div>

          {viewMode === 'table' && (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            paginatedTimeSlots.length > 0 &&
                            paginatedTimeSlots.every(slot => selectedSlots.includes(slot.id))
                          }
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTimeSlots.map((timeSlot) => (
                      <TableRow key={timeSlot.id} className={selectedSlots.includes(timeSlot.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedSlots.includes(timeSlot.id)}
                            onChange={() => toggleSelectSlot(timeSlot.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{formatDate(timeSlot.date)}</div>
                              <div className="text-sm text-gray-500">{timeSlot.date}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{timeSlot.room.name}</div>
                            <div className="text-sm text-gray-500">
                              {timeSlot.room.type.replace(/_/g, ' ')} • {timeSlot.room.capacity} people
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={timeSlot.available ? 'default' : 'destructive'}>
                            {timeSlot.available ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Available</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" /> Booked</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(timeSlot)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this time slot? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTimeSlot(timeSlot.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTimeSlots.length > 0 && <PaginationComponent />}
            </>
          )}

          {viewMode === 'calendar' && (
            <div className="space-y-4">
              <style>{calendarStyles}</style>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Label>Room Filter:</Label>
                  <Select value={roomFilter} onValueChange={setRoomFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rooms</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 min-h-[600px]">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  view={calendarView}
                  onView={setCalendarView}
                  date={calendarDate}
                  onNavigate={setCalendarDate}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable={true}
                  popup={true}
                  step={30}
                  timeslots={2}
                  min={new Date(2024, 0, 1, 1, 0, 0)}
                  max={new Date(2024, 0, 1, 23, 0, 0)}
                  scrollToTime={new Date(2024, 0, 1, 8, 0, 0)}
                  components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent,
                  }}
                  formats={{
                    timeGutterFormat: 'HH:mm',
                    eventTimeRangeFormat: ({ start, end }: any) =>
                      `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                    agendaTimeRangeFormat: ({ start, end }: any) =>
                      `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                  }}
                  eventPropGetter={(event) => ({
                    className: event.className,
                    style: {
                      fontSize: '12px',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      border: 'none',
                    }
                  })}
                  dayPropGetter={(date) => ({
                    style: {
                      backgroundColor: moment(date).isSame(moment(), 'day')
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'transparent'
                    }
                  })}
                  slotPropGetter={(date) => ({
                    style: {
                      backgroundColor: moment(date).isSame(moment(), 'day')
                        ? 'rgba(59, 130, 246, 0.05)'
                        : 'transparent'
                    }
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Today's Schedule</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {calendarEvents.filter(event =>
                      moment(event.start).isSame(moment(), 'day')
                    ).length} slots scheduled today
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">This Week</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {calendarEvents.filter(event =>
                      moment(event.start).isSame(moment(), 'week')
                    ).length} slots this week
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Availability</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round((calendarEvents.filter(e => e.resource.available).length / calendarEvents.length) * 100) || 0}% available
                  </div>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button onClick={openCreateDialog} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add Slot
                </Button>
                <Button onClick={openBulkCreateDialog} variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Bulk Create for Week
                </Button>
                <Button
                  onClick={() => {
                    const today = new Date();
                    setCalendarDate(today);
                    setDateFilter('');
                    setCalendarView(Views.DAY);
                  }}
                  variant="outline"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Jump to Today
                </Button>
              </div>
            </div>
          )}

          {selectedSlots.length > 0 && viewMode === 'table' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center justify-between">
              <span className="font-medium">
                {selectedSlots.length} time slot{selectedSlots.length > 1 ? 's' : ''} selected
                {totalPages > 1 && (
                  <span className="text-sm text-gray-600 ml-2">
                    (across {totalPages} page{totalPages > 1 ? 's' : ''})
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSlots([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {filteredTimeSlots.length === 0 && viewMode === 'table' && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No time slots found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Time Slot</DialogTitle>
            <DialogDescription>Add a new time slot for room booking</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-date">Date *</Label>
              <Input
                id="create-date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-startTime">Start Time *</Label>
                <Input
                  id="create-startTime"
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="create-endTime">End Time *</Label>
                <Input
                  id="create-endTime"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="create-room">Room *</Label>
              <Select value={formData.roomId?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.name} - {room.type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTimeSlot}>
                Create Time Slot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Time Slot</DialogTitle>
            <DialogDescription>Update time slot information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startTime">Start Time *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit-endTime">End Time *</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-room">Room *</Label>
              <Select value={formData.roomId?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.name} - {room.type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTimeSlot}>
                Update Time Slot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkCreateDialogOpen} onOpenChange={setIsBulkCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Create Time Slots</DialogTitle>
            <DialogDescription>Create multiple time slots across date ranges with recurring options</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-startDate">Start Date *</Label>
                <Input
                  id="bulk-startDate"
                  type="date"
                  value={bulkFormData.startDate}
                  onChange={(e) => setBulkFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="bulk-endDate">End Date *</Label>
                <Input
                  id="bulk-endDate"
                  type="date"
                  value={bulkFormData.endDate}
                  onChange={(e) => setBulkFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={bulkFormData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bulk-room">Room *</Label>
              <Select
                value={bulkFormData.roomId}
                onValueChange={(value) => setBulkFormData(prev => ({ ...prev, roomId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.name} - {room.type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Time Slots *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTimeSlot}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time Slot
                </Button>
              </div>
              <div className="space-y-3">
                {bulkFormData.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                    {bulkFormData.timeSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="repeatWeekly"
                  checked={bulkFormData.repeatWeekly}
                  onChange={(e) => setBulkFormData(prev => ({ ...prev, repeatWeekly: e.target.checked }))}
                />
                <Label htmlFor="repeatWeekly">Repeat Weekly</Label>
              </div>

              {bulkFormData.repeatWeekly && (
                <div>
                  <Label className="mb-3 block">Select Days of Week</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <Button
                        key={day}
                        type="button"
                        variant={bulkFormData.weekDays.includes(index) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleWeekDay(index)}
                        className="w-full"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipWeekends"
                    checked={bulkFormData.skipWeekends}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, skipWeekends: e.target.checked }))}
                  />
                  <Label htmlFor="skipWeekends">Skip Weekends</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipHolidays"
                    checked={bulkFormData.skipHolidays}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, skipHolidays: e.target.checked }))}
                  />
                  <Label htmlFor="skipHolidays">Skip Holidays (if configured)</Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="mb-3 block">Quick Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkFormData(prev => ({
                      ...prev,
                      timeSlots: [
                        { startTime: '09:00', endTime: '10:00' },
                        { startTime: '10:00', endTime: '11:00' },
                        { startTime: '11:00', endTime: '12:00' },
                        { startTime: '14:00', endTime: '15:00' },
                        { startTime: '15:00', endTime: '16:00' },
                        { startTime: '16:00', endTime: '17:00' }
                      ],
                      repeatWeekly: true,
                      weekDays: [1, 2, 3, 4, 5],
                      skipWeekends: true
                    }));
                  }}
                >
                  Business Hours
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkFormData(prev => ({
                      ...prev,
                      timeSlots: [
                        { startTime: '08:00', endTime: '12:00' },
                        { startTime: '13:00', endTime: '17:00' }
                      ],
                      repeatWeekly: true,
                      weekDays: [1, 2, 3, 4, 5]
                    }));
                  }}
                >
                  Half Days
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkFormData(prev => ({
                      ...prev,
                      timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
                      repeatWeekly: true,
                      weekDays: [1, 2, 3, 4, 5]
                    }));
                  }}
                >
                  Full Days
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkFormData(prev => ({
                      ...prev,
                      timeSlots: [
                        { startTime: '10:00', endTime: '12:00' },
                        { startTime: '14:00', endTime: '16:00' }
                      ],
                      repeatWeekly: true,
                      weekDays: [6, 7]
                    }));
                  }}
                >
                  Weekends
                </Button>
              </div>
            </div>

            {bulkFormData.startDate && bulkFormData.endDate && bulkFormData.timeSlots.some(slot => slot.startTime && slot.endTime) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <Label className="text-sm font-medium">Preview</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  This will create approximately{' '}
                  <span className="font-medium">
                    {(() => {
                      const start = new Date(bulkFormData.startDate);
                      const end = new Date(bulkFormData.endDate);
                      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      const validTimeSlots = bulkFormData.timeSlots.filter(slot => slot.startTime && slot.endTime).length;
                      return days * validTimeSlots;
                    })()}
                  </span>{' '}
                  time slots across{' '}
                  <span className="font-medium">
                    {Math.ceil((new Date(bulkFormData.endDate).getTime() - new Date(bulkFormData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                  </span>{' '}
                  days with{' '}
                  <span className="font-medium">
                    {bulkFormData.timeSlots.filter(slot => slot.startTime && slot.endTime).length}
                  </span>{' '}
                  time slots per day.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsBulkCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkCreate}>
                Create Time Slots
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Time Slot Details</DialogTitle>
            <DialogDescription>
              {selectedEvent?.resource?.room?.name} - {selectedEvent?.resource ? formatDate(selectedEvent.resource.date) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent?.resource && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {formatTime(selectedEvent.resource.startTime)}
                  </div>
                </div>
                <div>
                  <Label>End Time</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {formatTime(selectedEvent.resource.endTime)}
                  </div>
                </div>
              </div>

              <div>
                <Label>Room Details</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-medium">{selectedEvent.resource.room.name}</div>
                  <div className="text-sm text-gray-500">
                    {selectedEvent.resource.room.type.replace(/_/g, ' ')} • {selectedEvent.resource.room.capacity} people
                  </div>
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <div className="p-2">
                  <Badge variant={selectedEvent.resource.available ? 'default' : 'destructive'}>
                    {selectedEvent.resource.available ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Available</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Booked</>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    openEditDialog(selectedEvent.resource);
                    setSelectedEvent(null);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this time slot? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleDeleteTimeSlot(selectedEvent.resource.id);
                          setSelectedEvent(null);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSlots.length} Time Slots</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSlots.length} selected time slots? This action cannot be undone.
              {selectedSlots.some(id => !timeSlots.find(s => s.id === id)?.available) && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  ⚠️ Some selected slots are already booked. Deleting them will cancel existing bookings.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkCreate}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default TimeSlotManagement;