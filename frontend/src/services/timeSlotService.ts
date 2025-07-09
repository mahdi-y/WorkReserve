/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../lib/api';

export interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  room: {
    id: number;
    name: string;
    type: string;
    capacity: number;
    pricePerHour: number;
  };
  available: boolean;
}

export interface TimeSlotRequest {
  date: string;
  startTime: string;
  endTime: string;
  roomId: number;
}

export interface BulkTimeSlotRequest {
  startDate: string;
  endDate: string;
  roomId: number;
  timeSlots: { startTime: string; endTime: string }[];
  repeatWeekly?: boolean;
  weekDays?: number[];
  skipWeekends?: boolean;
  skipHolidays?: boolean;
}

export interface TimeSlotGenerationRequest {
  startDate: string;
  endDate: string;
  roomId: number;
  timeSlots: { startTime: string; endTime: string }[];
  repeatWeekly?: boolean;
  weekDays?: number[];
  skipWeekends?: boolean;
  skipHolidays?: boolean;
}

export const timeSlotService = {
  getAllTimeSlots: async (): Promise<TimeSlot[]> => {
    const response = await api.get('/timeslots');
    return response.data;
  },

  getTimeSlotById: async (id: number): Promise<TimeSlot> => {
    const response = await api.get(`/timeslots/${id}`);
    return response.data;
  },

  getAvailableTimeSlots: async (startDate: string, endDate: string): Promise<TimeSlot[]> => {
    const response = await api.get('/timeslots/available', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getTimeSlotsByRoom: async (roomId: number): Promise<TimeSlot[]> => {
    const response = await api.get(`/timeslots/room/${roomId}`);
    return response.data;
  },

  getTimeSlotsByDateRange: async (startDate: string, endDate: string): Promise<TimeSlot[]> => {
    const response = await api.get('/timeslots/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  createTimeSlot: async (timeSlot: TimeSlotRequest): Promise<TimeSlot> => {
    const response = await api.post('/timeslots', timeSlot);
    return response.data;
  },

  createTimeSlotsBulk: async (request: BulkTimeSlotRequest): Promise<TimeSlot[]> => {
    const response = await api.post('/timeslots/bulk', request);
    return response.data;
  },

  updateTimeSlot: async (id: number, timeSlot: TimeSlotRequest): Promise<TimeSlot> => {
    const response = await api.put(`/timeslots/${id}`, timeSlot);
    return response.data;
  },

  deleteTimeSlot: async (id: number): Promise<void> => {
    await api.delete(`/timeslots/${id}`);
  },

  createBulkTimeSlots: async (request: BulkTimeSlotRequest): Promise<TimeSlot[]> => {
    const response = await api.post('/timeslots/bulk-generate', request);
    return response.data;
  },

  generateWeeklySlots: async (request: {
    startDate: string;
    weeks: number;
    roomId: number;
    timeSlots: { startTime: string; endTime: string }[];
    weekDays: number[];
  }): Promise<TimeSlot[]> => {
    const endDate = new Date(request.startDate);
    endDate.setDate(endDate.getDate() + (request.weeks * 7));
    
    return timeSlotService.createBulkTimeSlots({
      startDate: request.startDate,
      endDate: endDate.toISOString().split('T')[0],
      roomId: request.roomId,
      timeSlots: request.timeSlots,
      repeatWeekly: true,
      weekDays: request.weekDays,
      skipWeekends: false
    });
  },

  generateMonthlySlots: async (request: {
    year: number;
    month: number;
    roomId: number;
    timeSlots: { startTime: string; endTime: string }[];
    skipWeekends?: boolean;
  }): Promise<TimeSlot[]> => {
    const startDate = new Date(request.year, request.month - 1, 1);
    const endDate = new Date(request.year, request.month, 0);
    
    return timeSlotService.createBulkTimeSlots({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      roomId: request.roomId,
      timeSlots: request.timeSlots,
      skipWeekends: request.skipWeekends || false
    });
  },

  saveTemplate: async (template: {
    name: string;
    timeSlots: { startTime: string; endTime: string }[];
    settings: {
      repeatWeekly?: boolean;
      weekDays?: number[];
      skipWeekends?: boolean;
    };
  }): Promise<any> => {
    const response = await api.post('/timeslots/templates', template);
    return response.data;
  },

  getTemplates: async (): Promise<any[]> => {
    const response = await api.get('/timeslots/templates');
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/timeslots/templates/${id}`);
  },
};