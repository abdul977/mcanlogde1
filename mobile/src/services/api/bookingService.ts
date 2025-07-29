import { apiHelpers } from './apiClient';
import { ENDPOINTS } from '../../constants';
import { Booking, BookingForm, ApiResponse } from '../../types';

export interface CreateBookingData extends BookingForm {
  accommodationId: string;
  bookingType: 'accommodation' | 'program' | 'lecture' | 'quran_class' | 'event';
  programId?: string;
}

export const bookingService = {
  // Create new booking
  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    return apiHelpers.post<Booking>(ENDPOINTS.CREATE_BOOKING, bookingData);
  },

  // Get user's bookings
  getMyBookings: async (): Promise<Booking[]> => {
    return apiHelpers.get<Booking[]>(ENDPOINTS.MY_BOOKINGS);
  },

  // Get single booking
  getBooking: async (id: string): Promise<Booking> => {
    return apiHelpers.get<Booking>(`${ENDPOINTS.BOOKINGS}/${id}`);
  },

  // Cancel booking
  cancelBooking: async (id: string): Promise<ApiResponse> => {
    return apiHelpers.put<ApiResponse>(`${ENDPOINTS.BOOKINGS}/${id}/cancel`);
  },

  // Admin: Get all bookings
  getAllBookings: async (): Promise<Booking[]> => {
    return apiHelpers.get<Booking[]>(`${ENDPOINTS.BOOKINGS}/admin/all`);
  },

  // Admin: Update booking status
  updateBookingStatus: async (
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'cancelled',
    adminNotes?: string
  ): Promise<Booking> => {
    return apiHelpers.put<Booking>(`${ENDPOINTS.BOOKINGS}/admin/${id}/status`, {
      status,
      adminNotes,
    });
  },
};
