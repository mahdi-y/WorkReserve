import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Room {
  id: number;
  name: string;
  type: 'HOT_DESK' | 'DEDICATED_DESK' | 'CONFERENCE_ROOM' | 'PRIVATE_OFFICE';
  pricePerHour: number;
  capacity: number;
  description?: string;
  imageUrls: string[];
}

export interface RoomFilters {
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  capacity?: number;
}

export const roomService = {
  getAllRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getRoomById: async (id: number): Promise<Room> => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  getAvailableRooms: async (date: string, startTime: string, endTime: string): Promise<Room[]> => {
    const response = await api.get('/rooms/available', {
      params: { date, startTime, endTime }
    });
    return response.data;
  },

  uploadRoomImages: async (files: FileList): Promise<string[]> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/rooms/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createRoom: async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id: number, roomData: Partial<Room>): Promise<Room> => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id: number): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  },
};