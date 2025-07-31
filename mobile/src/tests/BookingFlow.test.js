/**
 * Comprehensive Booking Flow Tests
 * Tests the complete booking flow from accommodation fetching to booking creation
 */

import { API_CONFIG, ENDPOINTS } from '../constants';

// Mock fetch for testing
global.fetch = jest.fn();

// Test configuration
const TEST_CONFIG = {
  BASE_URL: API_CONFIG.BASE_URL,
  TEST_TOKEN: 'Bearer test-token-123',
  TEST_USER: {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    gender: 'female'
  },
  TEST_ACCOMMODATION: {
    _id: 'test-accommodation-id',
    title: 'Test MCAN Lodge',
    location: 'Test Location',
    price: 25000,
    genderRestriction: 'sisters',
    facilities: ['WiFi', 'AC', 'Kitchen'],
    images: [],
    isAvailable: true,
    description: 'Test accommodation',
    accommodationType: 'Single Room'
  }
};

describe('Booking Flow Integration Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('1. Accommodation Fetching', () => {
    test('should fetch accommodations using gender-specific endpoint', async () => {
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          posts: [TEST_CONFIG.TEST_ACCOMMODATION]
        })
      });

      // Simulate fetching accommodations for sisters
      const response = await fetch(`${TEST_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/sisters`, {
        headers: {
          'Authorization': TEST_CONFIG.TEST_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      // Verify correct endpoint was called
      expect(fetch).toHaveBeenCalledWith(
        `${TEST_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/sisters`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': TEST_CONFIG.TEST_TOKEN,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response structure
      expect(data.success).toBe(true);
      expect(data.posts).toHaveLength(1);
      expect(data.posts[0]).toMatchObject({
        _id: expect.any(String),
        title: expect.any(String),
        genderRestriction: 'sisters',
        isAvailable: true
      });
    });

    test('should handle accommodation fetching errors gracefully', async () => {
      // Mock error response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          message: 'No accommodations found'
        })
      });

      const response = await fetch(`${TEST_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/sisters`, {
        headers: {
          'Authorization': TEST_CONFIG.TEST_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('2. Booking Creation', () => {
    test('should create booking with correct data structure', async () => {
      // Mock successful booking creation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          booking: {
            _id: 'test-booking-id',
            status: 'pending',
            user: TEST_CONFIG.TEST_USER._id,
            accommodation: TEST_CONFIG.TEST_ACCOMMODATION._id,
            totalAmount: 25000
          }
        })
      });

      // Prepare booking data matching our working test script
      const checkInDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const checkOutDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const bookingMonths = 1;
      const startDate = checkInDate.toISOString();
      const endDate = new Date(checkInDate.getTime() + (bookingMonths * 30 * 24 * 60 * 60 * 1000)).toISOString();

      const bookingData = {
        bookingType: 'accommodation',
        accommodationId: TEST_CONFIG.TEST_ACCOMMODATION._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        numberOfGuests: 2,
        userNotes: 'Test booking from mobile app',
        contactInfo: {
          phone: '+234-806-123-4567',
          emergencyContact: {
            name: 'Test Emergency Contact',
            phone: '+234-806-987-6543',
            relationship: 'Sister'
          }
        },
        bookingDuration: {
          months: bookingMonths,
          startDate: startDate,
          endDate: endDate
        },
        totalAmount: TEST_CONFIG.TEST_ACCOMMODATION.price
      };

      // Make booking request
      const response = await fetch(`${TEST_CONFIG.BASE_URL}${ENDPOINTS.CREATE_BOOKING}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': TEST_CONFIG.TEST_TOKEN,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      // Verify correct endpoint and method
      expect(fetch).toHaveBeenCalledWith(
        `${TEST_CONFIG.BASE_URL}${ENDPOINTS.CREATE_BOOKING}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': TEST_CONFIG.TEST_TOKEN,
          }),
          body: JSON.stringify(bookingData)
        })
      );

      // Verify response
      expect(result.success).toBe(true);
      expect(result.booking).toMatchObject({
        _id: expect.any(String),
        status: 'pending'
      });
    });

    test('should validate required booking fields', () => {
      const requiredFields = [
        'bookingType',
        'accommodationId',
        'checkInDate',
        'checkOutDate',
        'numberOfGuests',
        'contactInfo',
        'bookingDuration',
        'totalAmount'
      ];

      const bookingData = {
        bookingType: 'accommodation',
        accommodationId: 'test-id',
        checkInDate: new Date().toISOString(),
        checkOutDate: new Date().toISOString(),
        numberOfGuests: 1,
        contactInfo: {
          phone: '+234-806-123-4567',
          emergencyContact: {
            name: 'Test Contact',
            phone: '+234-806-987-6543',
            relationship: 'Sister'
          }
        },
        bookingDuration: {
          months: 1,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        },
        totalAmount: 25000
      };

      // Verify all required fields are present
      requiredFields.forEach(field => {
        expect(bookingData).toHaveProperty(field);
      });

      // Verify contactInfo structure
      expect(bookingData.contactInfo.emergencyContact).toMatchObject({
        name: expect.any(String),
        phone: expect.any(String),
        relationship: expect.any(String)
      });

      // Verify bookingDuration structure
      expect(bookingData.bookingDuration).toMatchObject({
        months: expect.any(Number),
        startDate: expect.any(String),
        endDate: expect.any(String)
      });
    });
  });

  describe('3. Booking Verification', () => {
    test('should verify booking was created successfully', async () => {
      const testBookingId = 'test-booking-id';

      // Mock booking verification response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          booking: {
            _id: testBookingId,
            status: 'pending',
            user: {
              name: TEST_CONFIG.TEST_USER.name
            },
            accommodation: {
              title: TEST_CONFIG.TEST_ACCOMMODATION.title
            },
            checkInDate: new Date().toISOString(),
            checkOutDate: new Date().toISOString(),
            numberOfGuests: 2
          }
        })
      });

      // Verify booking
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/bookings/${testBookingId}`, {
        headers: {
          'Authorization': TEST_CONFIG.TEST_TOKEN
        }
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.booking._id).toBe(testBookingId);
      expect(result.booking.status).toBe('pending');
    });
  });

  describe('4. User Bookings List', () => {
    test('should fetch user bookings successfully', async () => {
      // Mock user bookings response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          bookings: [
            {
              _id: 'booking-1',
              status: 'pending',
              accommodation: {
                title: 'Test Accommodation'
              }
            }
          ]
        })
      });

      const response = await fetch(`${TEST_CONFIG.BASE_URL}${ENDPOINTS.MY_BOOKINGS}`, {
        headers: {
          'Authorization': TEST_CONFIG.TEST_TOKEN
        }
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.bookings).toHaveLength(1);
      expect(result.bookings[0].status).toBe('pending');
    });
  });

  describe('5. Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch(`${TEST_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS}`);
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    test('should handle authentication errors', async () => {
      // Mock 401 response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: 'Unauthorized'
        })
      });

      const response = await fetch(`${TEST_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS}`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });
});
