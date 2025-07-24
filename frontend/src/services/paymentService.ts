import api from '../lib/api';

export interface PaymentIntentRequest {
  slotId: number;
  teamSize: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  slotId: number;
  teamSize: number;
}

export const paymentService = {
  getConfig: async (): Promise<{ publishableKey: string }> => {
    const res = await api.get('/payments/config');
    return res.data;
  },

  createPaymentIntent: async (data: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
    const res = await api.post('/payments/create-payment-intent', data);
    return res.data;
  },

  confirmPayment: async (data: ConfirmPaymentRequest) => {
    const res = await api.post('/payments/confirm-payment', data);
    return res.data;
  }
};