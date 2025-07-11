import request from 'supertest';
import { expect } from 'chai';
import app from '../index.js';
import PaymentConfiguration from '../src/models/PaymentConfiguration.js';
import User from '../src/models/User.js';
import jwt from 'jsonwebtoken';

describe('Payment Configuration API', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  before(async () => {
    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    // Generate tokens
    adminToken = jwt.sign(
      { _id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    userToken = jwt.sign(
      { _id: regularUser._id, role: regularUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  after(async () => {
    // Clean up test data
    await PaymentConfiguration.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });
  });

  beforeEach(async () => {
    // Clean up payment configurations before each test
    await PaymentConfiguration.deleteMany({});
  });

  describe('GET /api/payment-config/details', () => {
    it('should return payment details for public access', async () => {
      // Create a test configuration
      await PaymentConfiguration.create({
        bankDetails: {
          accountName: 'Test Organization',
          accountNumber: '1234567890',
          bankName: 'Test Bank'
        },
        mobilePayment: {
          mtn: { number: '08012345678', accountName: 'Test Org' }
        }
      });

      const res = await request(app)
        .get('/api/payment-config/details')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.paymentDetails).to.have.property('bankDetails');
      expect(res.body.paymentDetails).to.have.property('mobilePayments');
      expect(res.body.paymentDetails.bankDetails.accountNumber).to.equal('1234567890');
    });

    it('should create default configuration if none exists', async () => {
      const res = await request(app)
        .get('/api/payment-config/details')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.paymentDetails).to.have.property('organizationName');
    });
  });

  describe('GET /api/payment-config/admin/config', () => {
    it('should return full configuration for admin', async () => {
      const config = await PaymentConfiguration.create({
        bankDetails: {
          accountName: 'Test Organization',
          accountNumber: '1234567890',
          bankName: 'Test Bank'
        }
      });

      const res = await request(app)
        .get('/api/payment-config/admin/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.configuration).to.have.property('_id');
      expect(res.body.configuration.bankDetails.accountNumber).to.equal('1234567890');
    });

    it('should deny access to non-admin users', async () => {
      const res = await request(app)
        .get('/api/payment-config/admin/config')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
    });

    it('should deny access without authentication', async () => {
      const res = await request(app)
        .get('/api/payment-config/admin/config')
        .expect(401);

      expect(res.body.success).to.be.false;
    });
  });

  describe('PUT /api/payment-config/admin/update', () => {
    it('should update payment configuration for admin', async () => {
      const updateData = {
        bankDetails: {
          accountName: 'Updated Organization',
          accountNumber: '9876543210',
          bankName: 'Updated Bank'
        },
        mobilePayment: {
          mtn: { number: '08087654321', accountName: 'Updated Org' }
        }
      };

      const res = await request(app)
        .put('/api/payment-config/admin/update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.configuration.bankDetails.accountNumber).to.equal('9876543210');
      expect(res.body.configuration.lastUpdatedBy.toString()).to.equal(adminUser._id.toString());
    });

    it('should validate configuration before saving', async () => {
      const invalidData = {
        bankDetails: {
          accountName: '',
          accountNumber: '',
          bankName: ''
        },
        mobilePayment: {},
        onlinePayment: {
          paystack: { isActive: false },
          flutterwave: { isActive: false }
        }
      };

      const res = await request(app)
        .put('/api/payment-config/admin/update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('Invalid payment configuration');
    });

    it('should deny access to non-admin users', async () => {
      const res = await request(app)
        .put('/api/payment-config/admin/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);

      expect(res.body.success).to.be.false;
    });
  });

  describe('GET /api/payment-config/admin/test', () => {
    it('should test payment configuration', async () => {
      await PaymentConfiguration.create({
        bankDetails: {
          accountName: 'Test Organization',
          accountNumber: '1234567890',
          bankName: 'Test Bank'
        }
      });

      const res = await request(app)
        .get('/api/payment-config/admin/test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.testResults).to.have.property('isValid');
      expect(res.body.testResults).to.have.property('hasBankDetails');
      expect(res.body.testResults.hasBankDetails).to.be.true;
    });
  });

  describe('POST /api/payment-config/admin/reset', () => {
    it('should reset configuration to defaults', async () => {
      // Create existing configuration
      await PaymentConfiguration.create({
        bankDetails: {
          accountName: 'Existing Organization',
          accountNumber: '1111111111',
          bankName: 'Existing Bank'
        }
      });

      const res = await request(app)
        .post('/api/payment-config/admin/reset')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.configuration.bankDetails.accountName).to.equal('Muslim Corps Members Association of Nigeria');
    });
  });

  describe('GET /api/payment-config/admin/history', () => {
    it('should return configuration history with pagination', async () => {
      // Create multiple configurations
      for (let i = 0; i < 5; i++) {
        await PaymentConfiguration.create({
          bankDetails: {
            accountName: `Organization ${i}`,
            accountNumber: `123456789${i}`,
            bankName: `Bank ${i}`
          },
          lastUpdatedBy: adminUser._id
        });
      }

      const res = await request(app)
        .get('/api/payment-config/admin/history?page=1&limit=3')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.history).to.have.lengthOf(3);
      expect(res.body.pagination).to.have.property('totalPages');
      expect(res.body.pagination.totalRecords).to.equal(5);
    });
  });

  describe('POST /api/payment-config/admin/validate-method', () => {
    it('should validate bank payment method', async () => {
      const validationData = {
        method: 'bank',
        details: {
          accountName: 'Test Organization',
          accountNumber: '1234567890',
          bankName: 'Test Bank'
        }
      };

      const res = await request(app)
        .post('/api/payment-config/admin/validate-method')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validationData)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.isValid).to.be.true;
      expect(res.body.errors).to.have.lengthOf(0);
    });

    it('should return validation errors for incomplete bank details', async () => {
      const validationData = {
        method: 'bank',
        details: {
          accountName: '',
          accountNumber: '1234567890'
          // Missing bankName
        }
      };

      const res = await request(app)
        .post('/api/payment-config/admin/validate-method')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validationData)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.isValid).to.be.false;
      expect(res.body.errors).to.include('Account name is required');
      expect(res.body.errors).to.include('Bank name is required');
    });

    it('should validate mobile payment method', async () => {
      const validationData = {
        method: 'mobile',
        details: {
          number: '08012345678',
          provider: 'MTN'
        }
      };

      const res = await request(app)
        .post('/api/payment-config/admin/validate-method')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validationData)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.isValid).to.be.true;
    });
  });
});
