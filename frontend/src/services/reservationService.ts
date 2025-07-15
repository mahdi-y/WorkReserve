import api from '../lib/api';

export interface Reservation {
  id: number;
  slotId: number;
  userId: number;
  userName: string;
  teamSize: number;
  totalCost: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;

  slot?: {
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
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface ReservationRequest {
  slotId: number;
  teamSize: number;
}

export const reservationService = {
  getAll: async (): Promise<Reservation[]> => {
    const res = await api.get('/reservations');
    return res.data;
  },
  
  getMine: async (): Promise<Reservation[]> => {
    const res = await api.get('/reservations/user');
    return res.data;
  },
  
  getById: async (id: number): Promise<Reservation> => {
    const res = await api.get(`/reservations/${id}`);
    return res.data;
  },
  
  create: async (data: ReservationRequest): Promise<Reservation> => {
    const res = await api.post('/reservations', data);
    return res.data;
  },
  
  update: async (id: number, data: ReservationRequest): Promise<Reservation> => {
    const res = await api.put(`/reservations/${id}`, data);
    return res.data;
  },
  
  cancel: async (id: number): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },
  
  updateStatus: async (id: number, status: string): Promise<Reservation> => {
    const res = await api.put(`/reservations/${id}/status`, null, { params: { status } });
    return res.data;
  }
};