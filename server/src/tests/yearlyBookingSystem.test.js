// Comprehensive test suite for yearly booking system
// This file contains integration tests for the complete yearly accommodation booking workflow

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Booking from '../models/Booking.js';
import PaymentVerification from '../models/PaymentVerification.js';
import PaymentReminder from '../models/PaymentReminder.js';

describe('Yearly Booking System Integration Tests', () => {
  let testUser, testAdmin, testAccommodation, authToken, adminToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DB_URI || 'mongodb://localhost:27017/mcan_test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Booking.deleteMany({});
    await PaymentVerification.deleteMany({});
    await PaymentReminder.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });

    // Create test admin
    testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create test accommodation
    testAccommodation = await Post.create({
      title: 'Test Accommodation',
      description: 'A test accommodation for yearly booking',
      price: 50000, // ₦50,000 per month
      location: 'Test Location',
      accommodationType: 'room',
      isAvailable: true,
      author: testAdmin._id
    });

    // Get auth tokens
    const userLogin = await request(app)
      .post('/auth/api/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    authToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post('/auth/api/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    adminToken = adminLogin.body.token;
  });

  describe('Yearly Booking Creation', () => {
    it('should create a yearly booking with payment schedule', async () => {
      const bookingData = {
        bookingType: 'accommodation',
        accommodationId: testAccommodation._id,
        checkInDate: '2024-01-01',
        bookingDuration: {
          months: 6,
          startDate: '2024-01-01',
          endDate: '2024-07-01'
        },
        totalAmount: 300000, // 6 months × ₦50,000
        numberOfGuests: 2,
        userNotes: 'Test yearly booking',
        contactInfo: {
          phone: '+2341234567890'
        }
      };

      const response = await request(app)
        .post('/api/bookings/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.booking.bookingDuration.months).toBe(6);
      expect(response.body.booking.totalAmount).toBe(300000);
      expect(response.body.booking.paymentSchedule).toHaveLength(6);
      
      // Verify payment schedule structure
      const paymentSchedule = response.body.booking.paymentSchedule;
      expect(paymentSchedule[0].monthNumber).toBe(1);
      expect(paymentSchedule[0].amount).toBe(50000);
      expect(paymentSchedule[0].status).toBe('pending');
    });

    it('should enforce 12-month maximum duration', async () => {
      const bookingData = {
        bookingType: 'accommodation',
        accommodationId: testAccommodation._id,
        checkInDate: '2024-01-01',
        bookingDuration: {
          months: 15, // Exceeds 12-month limit
          startDate: '2024-01-01',
          endDate: '2025-04-01'
        },
        numberOfGuests: 1,
        contactInfo: { phone: '+2341234567890' }
      };

      const response = await request(app)
        .post('/api/bookings/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      // Should either reject or cap at 12 months
      if (response.status === 400) {
        expect(response.body.success).toBe(false);
      } else {
        expect(response.body.booking.bookingDuration.months).toBeLessThanOrEqual(12);
      }
    });
  });

  describe('Payment Verification Workflow', () => {
    let testBooking;

    beforeEach(async () => {
      // Create a test booking first
      testBooking = await Booking.create({
        user: testUser._id,
        bookingType: 'accommodation',
        accommodation: testAccommodation._id,
        checkInDate: new Date('2024-01-01'),
        checkOutDate: new Date('2024-07-01'),
        bookingDuration: {
          months: 6,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-07-01')
        },
        totalAmount: 300000,
        paymentSchedule: [
          {
            monthNumber: 1,
            dueDate: new Date('2024-01-01'),
            amount: 50000,
            status: 'pending'
          },
          {
            monthNumber: 2,
            dueDate: new Date('2024-02-01'),
            amount: 50000,
            status: 'pending'
          }
        ],
        status: 'approved'
      });
    });

    it('should submit payment proof successfully', async () => {
      const paymentData = {
        bookingId: testBooking._id,
        monthNumber: 1,
        amount: 50000,
        paymentMethod: 'bank_transfer',
        paymentDate: '2024-01-01',
        transactionReference: 'TXN123456',
        userNotes: 'Payment for month 1'
      };

      // Mock file upload
      const response = await request(app)
        .post('/api/payments/submit-proof')
        .set('Authorization', `Bearer ${authToken}`)
        .field('bookingId', paymentData.bookingId.toString())
        .field('monthNumber', paymentData.monthNumber.toString())
        .field('amount', paymentData.amount.toString())
        .field('paymentMethod', paymentData.paymentMethod)
        .field('paymentDate', paymentData.paymentDate)
        .field('transactionReference', paymentData.transactionReference)
        .field('userNotes', paymentData.userNotes)
        .attach('paymentScreenshot', Buffer.from('fake image data'), 'payment.jpg');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentVerification.verificationStatus).toBe('pending');
    });

    it('should allow admin to approve payment', async () => {
      // First create a payment verification
      const paymentVerification = await PaymentVerification.create({
        booking: testBooking._id,
        user: testUser._id,
        monthNumber: 1,
        amount: 50000,
        paymentScreenshot: {
          url: '/uploads/test-payment.jpg',
          filename: 'test-payment.jpg'
        },
        paymentMethod: 'bank_transfer',
        paymentDate: new Date('2024-01-01'),
        verificationStatus: 'pending'
      });

      const response = await request(app)
        .post('/api/payments/admin/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paymentId: paymentVerification._id,
          action: 'approve',
          adminNotes: 'Payment verified successfully'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.payment.verificationStatus).toBe('approved');
    });
  });

  describe('Payment Reminders', () => {
    it('should create payment reminders for upcoming due dates', async () => {
      const booking = await Booking.create({
        user: testUser._id,
        bookingType: 'accommodation',
        accommodation: testAccommodation._id,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        bookingDuration: { months: 6 },
        paymentSchedule: [
          {
            monthNumber: 1,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
            amount: 50000,
            status: 'pending'
          }
        ],
        status: 'approved'
      });

      const reminder = await PaymentReminder.createUpcomingReminder(
        booking,
        1,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        50000
      );

      expect(reminder).toBeDefined();
      expect(reminder.reminderType).toBe('upcoming');
      expect(reminder.monthNumber).toBe(1);
      expect(reminder.amount).toBe(50000);
    });
  });

  describe('Analytics and Statistics', () => {
    it('should fetch payment statistics for admin', async () => {
      // Create some test payment verifications
      await PaymentVerification.create([
        {
          booking: testBooking._id,
          user: testUser._id,
          monthNumber: 1,
          amount: 50000,
          verificationStatus: 'approved',
          paymentMethod: 'bank_transfer',
          paymentDate: new Date()
        },
        {
          booking: testBooking._id,
          user: testUser._id,
          monthNumber: 2,
          amount: 50000,
          verificationStatus: 'pending',
          paymentMethod: 'mobile_money',
          paymentDate: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/payments/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.statistics.total).toBeGreaterThan(0);
      expect(response.body.statistics.approved).toBeGreaterThan(0);
      expect(response.body.statistics.pending).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid booking duration', async () => {
      const bookingData = {
        bookingType: 'accommodation',
        accommodationId: testAccommodation._id,
        checkInDate: '2024-01-01',
        bookingDuration: {
          months: 0 // Invalid duration
        },
        numberOfGuests: 1,
        contactInfo: { phone: '+2341234567890' }
      };

      const response = await request(app)
        .post('/api/bookings/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate payment submissions', async () => {
      // Create existing payment verification
      await PaymentVerification.create({
        booking: testBooking._id,
        user: testUser._id,
        monthNumber: 1,
        amount: 50000,
        verificationStatus: 'pending',
        paymentMethod: 'bank_transfer',
        paymentDate: new Date()
      });

      const paymentData = {
        bookingId: testBooking._id,
        monthNumber: 1,
        amount: 50000,
        paymentMethod: 'bank_transfer',
        paymentDate: '2024-01-01'
      };

      const response = await request(app)
        .post('/api/payments/submit-proof')
        .set('Authorization', `Bearer ${authToken}`)
        .field('bookingId', paymentData.bookingId.toString())
        .field('monthNumber', paymentData.monthNumber.toString())
        .field('amount', paymentData.amount.toString())
        .field('paymentMethod', paymentData.paymentMethod)
        .field('paymentDate', paymentData.paymentDate)
        .attach('paymentScreenshot', Buffer.from('fake image data'), 'payment.jpg');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
});

// Test helper functions
export const createTestBooking = async (userId, accommodationId, months = 6) => {
  return await Booking.create({
    user: userId,
    bookingType: 'accommodation',
    accommodation: accommodationId,
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
    bookingDuration: { months },
    totalAmount: months * 50000,
    paymentSchedule: Array.from({ length: months }, (_, i) => ({
      monthNumber: i + 1,
      dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
      amount: 50000,
      status: 'pending'
    })),
    status: 'approved'
  });
};

export const createTestPaymentVerification = async (bookingId, userId, monthNumber) => {
  return await PaymentVerification.create({
    booking: bookingId,
    user: userId,
    monthNumber,
    amount: 50000,
    paymentScreenshot: {
      url: '/uploads/test-payment.jpg',
      filename: 'test-payment.jpg'
    },
    paymentMethod: 'bank_transfer',
    paymentDate: new Date(),
    verificationStatus: 'pending'
  });
};
