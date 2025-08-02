# Configurable Booking Limits System - Deployment Guide

## Overview

This guide covers the deployment of the configurable booking limit system that transforms the accommodation booking platform from a single-booking model to a flexible multi-booking system with configurable limits per accommodation.

## 🚀 System Changes Summary

### Database Schema Updates
- **Post Model**: Added `maxBookings` field (1-100 range) and `bookingStats` object
- **Booking Statistics**: Real-time tracking of approved, pending, and total booking counts
- **Availability Logic**: Changed from binary to count-based availability system

### API Enhancements
- **New Endpoints**: Booking statistics, admin configuration, and overview APIs
- **Enhanced Logic**: Count-based availability validation and atomic statistics updates
- **Performance**: Optimized database indexes and caching mechanisms

## 📋 Pre-Deployment Checklist

### 1. Database Backup
```bash
# Create a full database backup before deployment
mongodump --uri="your-mongodb-connection-string" --out=backup-$(date +%Y%m%d)
```

### 2. Environment Verification
- [ ] MongoDB connection string configured
- [ ] Node.js version 16+ installed
- [ ] All dependencies updated
- [ ] Environment variables set

### 3. Code Review
- [ ] All new files reviewed and tested
- [ ] Backward compatibility verified
- [ ] Error handling implemented
- [ ] Security measures in place

## 🔧 Deployment Steps

### Step 1: Deploy Code Changes
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build if necessary
npm run build
```

### Step 2: Run Database Migration
```bash
# Run the booking limits migration script
node server/src/scripts/migrateBookingLimits.js
```

**Expected Output:**
- Initialization of `maxBookings` field (default: 20)
- Population of `bookingStats` with current booking counts
- Update of `isAvailable` based on new logic

### Step 3: Optimize Database Indexes
```bash
# Run the index optimization script
node server/src/scripts/optimizeBookingIndexes.js
```

**Expected Output:**
- Creation of performance-optimized indexes
- Background index creation to minimize impact
- Query performance improvements

### Step 4: Validate System
```bash
# Run comprehensive system tests
node server/src/scripts/testBookingLimitSystem.js
```

**Expected Output:**
- All tests should pass (100% success rate)
- Backward compatibility confirmed
- Performance benchmarks met

### Step 5: Restart Application
```bash
# Restart the server application
pm2 restart mcan-server
# OR
npm run start
```

## 📊 New API Endpoints

### Booking Statistics
```http
GET /api/bookings/stats/:accommodationId
Authorization: Bearer <admin-token>
```

### Admin Booking Overview
```http
GET /api/posts/admin/booking-overview
Authorization: Bearer <admin-token>
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- sortBy: Sort field (occupancyRate, availableSlots, etc.)
- sortOrder: asc/desc (default: desc)
- filter: all/available/full/critical
```

### Update Booking Limits
```http
PUT /api/posts/admin/booking-limits/:postId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "maxBookings": 25
}
```

### Bulk Update Booking Limits
```http
PUT /api/posts/admin/booking-limits/bulk
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "updates": [
    { "postId": "accommodation-id-1", "maxBookings": 30 },
    { "postId": "accommodation-id-2", "maxBookings": 15 }
  ]
}
```

## 🔍 Monitoring and Validation

### Key Metrics to Monitor
1. **Booking Success Rate**: Should remain consistent or improve
2. **API Response Times**: Should be within acceptable limits (<500ms)
3. **Database Performance**: Query execution times should be optimized
4. **Error Rates**: Should remain low (<1%)

### Health Check Queries
```javascript
// Check accommodation availability accuracy
db.posts.aggregate([
  {
    $project: {
      title: 1,
      maxBookings: 1,
      approvedCount: "$bookingStats.approvedCount",
      isAvailable: 1,
      calculatedAvailability: { $lt: ["$bookingStats.approvedCount", "$maxBookings"] }
    }
  },
  {
    $match: {
      $expr: { $ne: ["$isAvailable", "$calculatedAvailability"] }
    }
  }
]);
```

### Performance Validation
```javascript
// Test query performance with explain
db.posts.find({
  "bookingStats.approvedCount": { $lt: "$maxBookings" },
  "isAvailable": true
}).explain("executionStats");
```

## 🚨 Rollback Plan

If issues arise during deployment:

### Step 1: Stop Application
```bash
pm2 stop mcan-server
```

### Step 2: Restore Database
```bash
# Restore from backup
mongorestore --uri="your-mongodb-connection-string" --drop backup-folder/
```

### Step 3: Revert Code
```bash
# Revert to previous stable version
git checkout previous-stable-commit
npm install
```

### Step 4: Restart Application
```bash
pm2 start mcan-server
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: Migration Script Fails
**Symptoms**: Error during `migrateBookingLimits.js` execution
**Solution**:
1. Check MongoDB connection
2. Verify user permissions
3. Run migration in smaller batches if needed

#### Issue: Performance Degradation
**Symptoms**: Slow API responses after deployment
**Solution**:
1. Run index optimization script
2. Check query execution plans
3. Monitor database resource usage

#### Issue: Booking Statistics Inconsistency
**Symptoms**: `isAvailable` doesn't match actual booking counts
**Solution**:
1. Run sync availability endpoint: `POST /api/bookings/admin/sync-availability`
2. Check for concurrent booking scenarios
3. Verify booking status transitions

#### Issue: API Endpoint Errors
**Symptoms**: 500 errors on new endpoints
**Solution**:
1. Check server logs for detailed error messages
2. Verify authentication middleware
3. Validate request parameters

## 📈 Performance Optimizations

### Database Indexes Created
- `booking_availability_idx`: For availability queries
- `booking_counts_idx`: For statistics calculations
- `accommodation_status_stats_idx`: For booking status queries
- `admin_overview_idx`: For admin dashboard queries

### Caching Strategy
- Booking statistics cached in Post model
- Atomic updates to prevent race conditions
- Background index creation for minimal impact

### Query Optimizations
- Compound indexes for complex queries
- Aggregation pipeline optimizations
- Efficient count operations

## 🔐 Security Considerations

### Access Control
- Admin-only endpoints properly protected
- Input validation on all new endpoints
- Rate limiting on statistics endpoints

### Data Integrity
- Atomic operations for booking statistics
- Transaction support for critical operations
- Validation constraints on booking limits

## 📚 Additional Resources

### Documentation Files
- `server/src/utils/bookingStatsUtils.js`: Utility functions documentation
- `server/src/scripts/`: Migration and optimization scripts
- API endpoint documentation in route files

### Monitoring Tools
- MongoDB Compass for database monitoring
- Application logs for error tracking
- Performance monitoring dashboards

## ✅ Post-Deployment Verification

After successful deployment, verify:

1. **Functionality**:
   - [ ] New bookings respect accommodation limits
   - [ ] Admin can update booking limits
   - [ ] Statistics display correctly
   - [ ] Availability logic works as expected

2. **Performance**:
   - [ ] API response times within limits
   - [ ] Database queries optimized
   - [ ] No memory leaks or resource issues

3. **Compatibility**:
   - [ ] Existing bookings unaffected
   - [ ] Client applications work normally
   - [ ] Mobile app compatibility maintained

## 🎯 Success Criteria

The deployment is considered successful when:
- All tests pass (100% success rate)
- No increase in error rates
- API response times remain optimal
- Booking functionality works as designed
- Admin interface displays correct statistics
- System handles concurrent bookings properly

## 📞 Support and Maintenance

For ongoing support:
1. Monitor application logs regularly
2. Run periodic system health checks
3. Update booking statistics if inconsistencies arise
4. Scale database resources as booking volume grows

---

**Deployment Date**: _To be filled during deployment_
**Deployed By**: _To be filled during deployment_
**Version**: v2.0.0 - Configurable Booking Limits System