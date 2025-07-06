# Admin Status Management System

## Overview
This system allows administrators to control accommodation visibility and status beyond just the booking system. Admins can now hide accommodations, mark them as "Coming Soon", "Under Maintenance", etc., regardless of booking status.

## New Features Added

### 1. Database Schema Updates (`server/src/models/Post.js`)

#### New Fields:
- **`adminStatus`**: Enum field with values:
  - `active` - Normal, bookable accommodation
  - `hidden` - Hidden from public view
  - `coming_soon` - Visible but marked as coming soon
  - `maintenance` - Under maintenance
  - `not_available` - Not available for booking

- **`adminNotes`**: Text field for admin notes about status
- **`isVisible`**: Boolean to control overall visibility

### 2. Backend API Updates

#### Updated Controllers (`server/src/controller/Post.js`):
- **`getAllPostController`**: Now respects admin status filters
  - Public access: Only shows `active` and `coming_soon` accommodations
  - Admin access: Can include hidden accommodations with `?includeHidden=true`

- **`updateAccommodationStatusController`**: New endpoint for status management
  - Route: `PUT /api/post/admin/status/:id`
  - Admin-only access
  - Updates `adminStatus`, `adminNotes`, and `isVisible`

#### Updated Routes (`server/src/routes/Post.js`):
- Added status management route with admin authentication

### 3. Frontend Admin Interface (`client/src/pages/Admin/AllPost.jsx`)

#### New Features:
- **Status Badges**: Visual indicators for both admin status and booking status
- **Quick Status Actions**: One-click buttons to change accommodation status
- **Enhanced Card View**: Shows both admin and booking status
- **Admin View**: Includes hidden accommodations in admin listing

#### Status Management Actions:
- **Make Active**: Set accommodation as active and visible
- **Hide**: Hide accommodation from public view
- **Coming Soon**: Mark as coming soon
- **Maintenance**: Mark as under maintenance
- **Not Available**: Mark as not available

### 4. Public Display Updates

#### Updated Components:
- **`Hotels.jsx`**: Home page accommodations respect admin status
- **`Product.jsx`**: Accommodation details show correct status badges

#### Status Display Logic:
- **Coming Soon**: Blue badge
- **Maintenance**: Yellow badge  
- **Not Available**: Red badge
- **Available**: Green badge (when active and not booked)
- **Booked**: Red badge (when accommodation is booked)

## Usage Guide

### For Administrators:

#### 1. View All Accommodations:
- Navigate to Admin → All Accommodations
- See both admin status and booking status for each accommodation
- Hidden accommodations are included in admin view

#### 2. Change Accommodation Status:
- **Quick Actions**: Use the status buttons in the accommodation card
- **Bulk Management**: Use the status update API endpoint

#### 3. Status Meanings:
- **Active**: Normal operation, users can book
- **Hidden**: Not visible to public, admin-only view
- **Coming Soon**: Visible but not bookable yet
- **Maintenance**: Temporarily unavailable for maintenance
- **Not Available**: Permanently not available

### For Users:

#### 1. Home Page Display:
- Only see accommodations marked as `active` or `coming_soon`
- Hidden accommodations don't appear
- Status badges show current availability

#### 2. Accommodation Details:
- Clear status indicators
- Booking disabled for non-active accommodations

## API Endpoints

### Update Accommodation Status:
```http
PUT /api/post/admin/status/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "adminStatus": "hidden|active|coming_soon|maintenance|not_available",
  "adminNotes": "Optional admin notes",
  "isVisible": true|false
}
```

### Get All Accommodations (Admin):
```http
GET /api/post/get-all-post?includeHidden=true
Authorization: Bearer <admin_token>
```

### Get All Accommodations (Public):
```http
GET /api/post/get-all-post
# Only returns active and coming_soon accommodations
```

## Status Priority Logic

The system follows this priority for status display:

1. **Admin Status** (highest priority)
   - If `hidden`: Not shown to public
   - If `coming_soon`: Shows "Coming Soon"
   - If `maintenance`: Shows "Maintenance"
   - If `not_available`: Shows "Not Available"

2. **Booking Status** (secondary)
   - If admin status is `active`:
     - Shows "Available" if `isAvailable: true`
     - Shows "Booked" if `isAvailable: false`

## Benefits

### 1. **Flexible Management**:
- Control accommodation visibility independently of bookings
- Prepare accommodations before making them bookable
- Handle maintenance periods gracefully

### 2. **Better User Experience**:
- Clear status communication
- No confusion about availability
- Professional handling of temporary unavailability

### 3. **Administrative Control**:
- Quick status changes without editing full accommodation details
- Bulk status management capabilities
- Audit trail through admin notes

## Future Enhancements

1. **Scheduled Status Changes**: Automatically change status at specific dates
2. **Status History**: Track status change history
3. **Notification System**: Alert users when accommodations become available
4. **Advanced Filtering**: Filter accommodations by admin status in public view
