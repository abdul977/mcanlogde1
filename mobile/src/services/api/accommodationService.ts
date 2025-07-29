import { apiHelpers } from './apiClient';
import { ENDPOINTS } from '../../constants';
import { Accommodation, PaginatedResponse } from '../../types';

export interface AccommodationFilters {
  gender?: 'male' | 'female' | 'mixed';
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  location?: string;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export const accommodationService = {
  // Get all accommodations
  getAccommodations: async (
    filters?: AccommodationFilters
  ): Promise<PaginatedResponse<Accommodation>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(key, item.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const url = `${ENDPOINTS.ACCOMMODATIONS}${params.toString() ? `?${params.toString()}` : ''}`;
    return apiHelpers.get<PaginatedResponse<Accommodation>>(url);
  },

  // Get accommodations by gender
  getAccommodationsByGender: async (
    gender: 'male' | 'female' | 'mixed'
  ): Promise<Accommodation[]> => {
    return apiHelpers.get<Accommodation[]>(`${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/${gender}`);
  },

  // Get single accommodation
  getAccommodation: async (id: string): Promise<Accommodation> => {
    return apiHelpers.get<Accommodation>(`${ENDPOINTS.ACCOMMODATION_DETAILS}/${id}`);
  },

  // Search accommodations
  searchAccommodations: async (query: string): Promise<Accommodation[]> => {
    return apiHelpers.get<Accommodation[]>(`${ENDPOINTS.ACCOMMODATIONS}/search?q=${encodeURIComponent(query)}`);
  },
};
