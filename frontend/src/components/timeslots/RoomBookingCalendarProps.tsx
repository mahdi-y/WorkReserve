/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin } from 'lucide-react';
import { timeSlotService, type TimeSlot } from '../../services/timeSlotService';
import { useToast } from '../../hooks/use-toast';

const localizer = momentLocalizer(moment);

interface RoomBookingCalendarProps {
  roomId: number;
  roomInfo?: {
    id: number;
    name: string;
    type: string;
    capacity: number;
    pricePerHour: number;
  };
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  selectedTimeSlot?: TimeSlot | null;
  initialDate?: string;
}

const calendarStyles = `
  .rbc-calendar {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    min-height: 750px;
  }

  .rbc-event {
    padding: 4px 6px !important;
    margin: 2px 3px !important;
    border-radius: 6px !important;
    box-sizing: border-box;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    min-height: 20px !important;
  }

  .rbc-event-content {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.2 !important;
  }

  .dark .rbc-calendar {
    background: rgb(17 24 39);
    color: rgb(243 244 246);
    border-color: rgb(55 65 81);
  }

  .rbc-month-row {
    min-height: 60px !important;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  
  .rbc-date-cell {
    padding: 2px !important;
    flex: 1 0 0; 
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important; 
  }

  .rbc-row-content {
    position: relative;
    z-index: 2;
  }

  .rbc-month-view {
    min-height: 400px !important;
  }

  .rbc-overlay {
    background: white !important;
    border: 1px solid rgb(229 231 235) !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.1) !important;
    padding: 1rem !important;
    max-width: 300px !important;
  }
  
  .dark .rbc-overlay {
    background: rgb(31 41 55) !important;
    border: 1px solid rgb(75 85 99) !important;
    color: rgb(243 244 246) !important;
  }
  
  .rbc-overlay-header {
    border-bottom: 1px solid rgb(229 231 235) !important;
    padding-bottom: 0.5rem !important;
    margin-bottom: 0.5rem !important;
    font-weight: 600 !important;
  }
  
  .dark .rbc-overlay-header {
    border-bottom-color: rgb(75 85 99) !important;
    color: rgb(243 244 246) !important;
  }
  
  .rbc-show-more {
    color: rgb(59 130 246) !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    padding: 3px 6px !important;
    border-radius: 6px !important;
    transition: all 0.2s ease !important;
    background-color: transparent !important;
    text-decoration: none !important;
    display: block !important;
    text-align: center !important;
    margin-top: 4px !important;
  }
  
  .rbc-show-more:hover {
    background-color: rgb(59 130 246) !important;
    color: white !important;
  }
  
  .dark .rbc-show-more {
    color: rgb(96 165 250) !important;
  }
  
  .dark .rbc-show-more:hover {
    background-color: rgb(96 165 250) !important;
    color: rgb(17 24 39) !important;
  }
  
  .rbc-event.available-slot {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .rbc-event.available-slot:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
  
  .rbc-event.booked-slot {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    color: white;
    cursor: not-allowed;
    opacity: 0.8;
  }
  
  .rbc-event.selected-slot {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: 2px solid #1d4ed8;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    transform: scale(1.05);
  }
  
  .rbc-header {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-bottom: 2px solid #e2e8f0;
    font-weight: 600;
    padding: 12px 8px;
    color: #374151;
  }
  
  .dark .rbc-header {
    background: linear-gradient(135deg, rgb(30 41 59), rgb(15 23 42));
    border-bottom-color: rgb(51 65 85);
    color: rgb(203 213 225);
  }
  
  .rbc-today {
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  .dark .rbc-today {
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .rbc-time-slot {
    border-top: 1px solid #f1f5f9;
    transition: background-color 0.2s ease;
  }
  
  .rbc-time-slot:hover {
    background-color: rgba(59, 130, 246, 0.02);
  }
  
  .dark .rbc-time-slot {
    border-top-color: rgb(51 65 85);
  }
  
  .dark .rbc-time-slot:hover {
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  .rbc-toolbar {
    display: none;
  }
  
  .rbc-time-view .rbc-time-gutter {
    background: #f8fafc;
    border-right: 2px solid #e2e8f0;
  }
  
  .dark .rbc-time-view .rbc-time-gutter {
    background: rgb(15 23 42);
    border-right-color: rgb(51 65 85);
  }
  
  .rbc-timeslot-group {
    border-bottom: 1px solid #e5e7eb;
  }
  
  .dark .rbc-timeslot-group {
    border-bottom-color: rgb(55 65 81);
  }
`;

const RoomBookingCalendar: React.FC<RoomBookingCalendarProps> = ({
  roomId,
  roomInfo,
  onTimeSlotSelect,
  selectedTimeSlot,
  initialDate
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarView, setCalendarView] = useState<any>(Views.WEEK);
  const [calendarDate, setCalendarDate] = useState(() => {
    if (initialDate) {
      return new Date(initialDate);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTimeSlots();
  }, [roomId, calendarDate, calendarView]);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);

      let startDate: Date, endDate: Date;

      if (calendarView === Views.DAY) { 
        startDate = new Date(calendarDate);
        endDate = new Date(calendarDate);
      } else if (calendarView === Views.WEEK) {
        startDate = moment(calendarDate).startOf('week').toDate();
        endDate = moment(calendarDate).endOf('week').toDate();
      } else {
        startDate = moment(calendarDate).startOf('month').toDate();
        endDate = moment(calendarDate).endOf('month').toDate();
      }

      const slots = await timeSlotService.getTimeSlotsByDateRange(
        moment(startDate).format('YYYY-MM-DD'),
        moment(endDate).format('YYYY-MM-DD')
      );

      const now = moment();
      const roomSlots = slots.filter(slot => {
        if (slot.room.id !== roomId) return false;
        const slotDateTime = moment(`${slot.date} ${slot.endTime}`, 'YYYY-MM-DD HH:mm');
        return slotDateTime.isAfter(now);
      });
      setTimeSlots(roomSlots);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load time slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const convertTimeSlotsToEvents = () => {
    const events = timeSlots.map(slot => {
      const startDateTime = moment(`${slot.date} ${slot.startTime}`).toDate();
      const endDateTime = moment(`${slot.date} ${slot.endTime}`).toDate();
      
      let className = slot.available ? 'available-slot' : 'booked-slot';
      if (selectedTimeSlot?.id === slot.id) {
        className = 'selected-slot';
      }
      
      return {
        id: slot.id,
        title: slot.available ? 'Available' : 'Booked',
        start: startDateTime,
        end: endDateTime,
        resource: slot,
        className: className
      };
    });
    
    setCalendarEvents(events);
  };

  useEffect(() => {
    convertTimeSlotsToEvents();
  }, [timeSlots, selectedTimeSlot]);

  const handleSelectEvent = (event: any) => {
    if (event.resource.available) {
      onTimeSlotSelect(event.resource);
    } else {
      setSelectedEvent(event);
      setShowEventDialog(true);
    }
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
      <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-100 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('PREV')} className="hover:bg-blue-100">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('TODAY')} className="hover:bg-blue-100">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('NEXT')} className="hover:bg-blue-100">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{label}</h3>
          {roomInfo && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {roomInfo.name} • {roomInfo.capacity} people • {roomInfo.pricePerHour} TND/hour
            </p>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button 
            variant={calendarView === Views.DAY ? "default" : "outline"} 
            size="sm" 
            onClick={() => {
              setCalendarView(Views.DAY);
              onView(Views.DAY);
            }}
            className={calendarView === Views.DAY ? "bg-blue-600" : "hover:bg-blue-100"}
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
            className={calendarView === Views.WEEK ? "bg-blue-600" : "hover:bg-blue-100"}
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
            className={calendarView === Views.MONTH ? "bg-blue-600" : "hover:bg-blue-100"}
          >
            Month
          </Button>
        </div>
      </div>
    );
  };

  const CustomEvent = ({ event }: any) => {
    const isMonthView = calendarView === Views.MONTH;
    const isSelected = selectedTimeSlot?.id === event.resource.id;

    if (isMonthView) {
      return (
        <div className={`text-xs p-1 rounded ${isSelected ? 'ring-2 ring-blue-400' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{event.title}</span>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              event.resource.available ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
          </div>
          <div className="text-xs opacity-75 mt-1 truncate">
            {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
          </div>
        </div>
      );
    }
    
    const duration = moment(event.end).diff(moment(event.start), 'minutes');
    const isShortEvent = duration <= 60; 
    const isVeryShortEvent = duration <= 30; 
    
    if (isVeryShortEvent) {
      return (
        <div className={`p-1 h-full flex items-center justify-center ${isSelected ? 'ring-2 ring-blue-400' : ''}`}>
          <div className="text-center">
            <div className="font-medium text-xs truncate">{event.title}</div>
            <div className="text-xs opacity-75 truncate">
              {moment(event.start).format('HH:mm')}
            </div>
          </div>
        </div>
      );
    }
    
    if (isShortEvent) {
      return (
        <div className={`p-1 h-full ${isSelected ? 'ring-2 ring-blue-400' : ''}`}>
          <div className="font-medium text-xs truncate">{event.title}</div>
          <div className="text-xs opacity-75 truncate">
            {moment(event.start).format('HH:mm')}-{moment(event.end).format('HH:mm')}
          </div>
        </div>
      );
    }
    
    return (
      <div className={`p-2 h-full ${isSelected ? 'ring-2 ring-blue-400' : ''}`}>
        <div className="font-semibold text-sm truncate">{event.title}</div>
        <div className="text-xs opacity-90 mt-1 truncate">
          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </div>
      </div>
    );
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-6 h-6" />
                {roomInfo?.name || 'Room'} Calendar
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-blue-100">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {roomInfo?.type.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {roomInfo?.capacity} people
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {roomInfo?.pricePerHour} TND/hour
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <style>{calendarStyles}</style>
          
          <div className="p-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                view={calendarView}
                onView={setCalendarView}
                date={calendarDate}
                onNavigate={setCalendarDate}
                onSelectEvent={handleSelectEvent}
                selectable={false}
                popup={true}
                popupOffset={{ x: 10, y: 10 }}
                step={30}
                timeslots={2}
                min={new Date(2024, 0, 1, 6, 0, 0)}
                max={new Date(2024, 0, 1, 22, 0, 0)}
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
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: event.resource.available ? 'pointer' : 'not-allowed',
                  }
                })}
                dayPropGetter={(date) => ({
                  style: {
                    backgroundColor: moment(date).isSame(moment(), 'day') 
                      ? 'rgba(59, 130, 246, 0.02)' 
                      : 'transparent'
                  }
                })}
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-green-600"></div>
                <span className="text-gray-700 dark:text-gray-300">Available - Click to book</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-red-600"></div>
                <span className="text-gray-700 dark:text-gray-300">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-600 ring-2 ring-blue-300"></div>
                <span className="text-gray-700 dark:text-gray-300">Selected</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {calendarEvents.filter(e => e.resource.available).length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Available Slots</div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {calendarEvents.filter(e => !e.resource.available).length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Booked Slots</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calendarEvents.length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Slots</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Time Slot Details</DialogTitle>
          </DialogHeader>
          {selectedEvent?.resource && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-semibold text-lg">{selectedEvent.resource.room.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatDate(selectedEvent.resource.date)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Start Time</div>
                  <div className="font-medium">{formatTime(selectedEvent.resource.startTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">End Time</div>
                  <div className="font-medium">{formatTime(selectedEvent.resource.endTime)}</div>
                </div>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-700 dark:text-red-300">
                    This time slot is already booked
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Please select an available time slot to make a booking.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomBookingCalendar;