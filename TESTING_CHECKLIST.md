# Supabase Storage Migration Testing Checklist

This checklist helps verify that the migration from Cloudinary to Supabase Storage is working correctly.

## Pre-Testing Setup

### 1. Environment Configuration
- [ ] Verify `SUPABASE_URL` is set correctly in `.env`
- [ ] Verify `SUPABASE_ANON_KEY` is set correctly in `.env`
- [ ] Verify `SUPABASE_SERVICE_KEY` is set correctly in `.env`
- [ ] Confirm server starts without errors
- [ ] Check that Cloudinary dependencies are removed

### 2. Supabase Storage Buckets
Ensure all required buckets exist in your Supabase project:
- [ ] `mcan-donations` - Public bucket for donation images
- [ ] `mcan-posts` - Public bucket for accommodation images
- [ ] `mcan-community` - Public bucket for community event images
- [ ] `mcan-resources` - Public bucket for resource files
- [ ] `mcan-services` - Public bucket for service images
- [ ] `mcan-quran-classes` - Public bucket for Quran class images
- [ ] `mcan-authors` - Public bucket for author/instructor images
- [ ] `mcan-participants` - Public bucket for participant images
- [ ] `mcan-thumbnails` - Public bucket for thumbnail images

## Automated Testing

### 1. Run Storage Test Suite
```bash
cd server
node src/scripts/testSupabaseStorage.js
```

Expected results:
- [ ] All bucket access tests pass
- [ ] File upload functionality works
- [ ] Multiple file uploads work
- [ ] URL generation works correctly
- [ ] Error handling works properly

## Manual API Testing

### 1. Donation Controller Testing

#### Create Donation with Images
```bash
POST /api/donations
Content-Type: multipart/form-data

Fields:
- title: "Test Donation"
- description: "Test description"
- category: "education"
- image0: [image file]
- image1: [image file]
- image0_caption: "First image"
- image1_caption: "Second image"
```

Verify:
- [ ] Images upload successfully
- [ ] URLs are returned in response
- [ ] Images are accessible via returned URLs
- [ ] Images appear in Supabase Storage dashboard

#### Update Donation with New Images
```bash
PUT /api/donations/:id
Content-Type: multipart/form-data

Fields:
- image0: [new image file]
- image0_caption: "Updated image"
```

Verify:
- [ ] New image uploads successfully
- [ ] Old images remain accessible
- [ ] Response contains updated image URLs

### 2. Post Controller Testing

#### Create Accommodation Post
```bash
POST /api/posts
Content-Type: multipart/form-data

Fields:
- title: "Test Accommodation"
- description: "Test description"
- location: "Test Location"
- price: 100
- files: [3 image files]
```

Verify:
- [ ] All 3 images upload successfully
- [ ] Images array contains 3 URLs
- [ ] All images are accessible
- [ ] Images appear in correct bucket

#### Update Accommodation Post
```bash
PUT /api/posts/:id
Content-Type: multipart/form-data

Fields:
- files: [3 new image files]
```

Verify:
- [ ] New images upload successfully
- [ ] Response contains updated image URLs

### 3. Community Controller Testing

#### Create Community Event
```bash
POST /api/community
Content-Type: multipart/form-data

Fields:
- title: "Test Event"
- description: "Test description"
- category: "event"
- image0: [image file]
- participant_0_image: [participant image]
- participants: [JSON with participant data]
```

Verify:
- [ ] Event image uploads successfully
- [ ] Participant image uploads successfully
- [ ] Both images are accessible
- [ ] Images appear in correct buckets

### 4. Resource Controller Testing

#### Create Resource with File and Thumbnail
```bash
POST /api/resources
Content-Type: multipart/form-data

Fields:
- title: "Test Resource"
- description: "Test description"
- category: "document"
- file: [PDF or document file]
- thumbnail: [image file]
- authorImage: [author image file]
```

Verify:
- [ ] Main file uploads successfully
- [ ] Thumbnail uploads successfully
- [ ] Author image uploads successfully
- [ ] All files are accessible
- [ ] Files appear in correct buckets

### 5. Service Controller Testing

#### Create Service
```bash
POST /api/services
Content-Type: multipart/form-data

Fields:
- title: "Test Service"
- description: "Test description"
- category: "consultation"
- image: [image file]
```

Verify:
- [ ] Service image uploads successfully
- [ ] Image is accessible
- [ ] Image appears in correct bucket

### 6. Quran Class Controller Testing

#### Create Quran Class
```bash
POST /api/quran-classes
Content-Type: multipart/form-data

Fields:
- title: "Test Class"
- description: "Test description"
- program: "tajweed"
- image: [class image file]
- instructorImage: [instructor image file]
```

Verify:
- [ ] Class image uploads successfully
- [ ] Instructor image uploads successfully
- [ ] Both images are accessible
- [ ] Images appear in correct buckets

### 7. Contribute Controller Testing

#### Create Contribution
```bash
POST /api/contribute
Content-Type: multipart/form-data

Fields:
- title: "Test Contribution"
- description: "Test description"
- category: "suggestion"
- file: [image file]
```

Verify:
- [ ] Contribution image uploads successfully
- [ ] Image is accessible
- [ ] Image appears in correct bucket

## Frontend Integration Testing

### 1. Image Display
- [ ] All uploaded images display correctly on frontend
- [ ] Image URLs load without errors
- [ ] Images maintain proper aspect ratios
- [ ] No broken image links

### 2. Upload Forms
- [ ] All upload forms work correctly
- [ ] Progress indicators work (if implemented)
- [ ] Error messages display for failed uploads
- [ ] Success messages display for successful uploads

### 3. Performance
- [ ] Image loading times are acceptable
- [ ] No significant performance degradation
- [ ] CDN delivery works correctly

## Error Handling Testing

### 1. Invalid File Types
- [ ] Uploading non-image files to image fields shows appropriate error
- [ ] Server responds with proper error messages
- [ ] Frontend handles errors gracefully

### 2. Large Files
- [ ] Files exceeding size limits are rejected
- [ ] Appropriate error messages are shown
- [ ] Server doesn't crash with large files

### 3. Network Issues
- [ ] Failed uploads are handled gracefully
- [ ] Retry mechanisms work (if implemented)
- [ ] User is informed of upload failures

## Security Testing

### 1. Access Control
- [ ] Public buckets are accessible without authentication
- [ ] Private operations require proper authentication
- [ ] Unauthorized users cannot upload files

### 2. File Validation
- [ ] Only allowed file types can be uploaded
- [ ] File size limits are enforced
- [ ] Malicious files are rejected

## Performance Testing

### 1. Upload Speed
- [ ] Single file uploads complete in reasonable time
- [ ] Multiple file uploads work efficiently
- [ ] Large files upload without timeout

### 2. Download Speed
- [ ] Images load quickly from Supabase CDN
- [ ] No significant latency issues
- [ ] Global CDN distribution works

## Rollback Testing (Optional)

If you need to test rollback capability:
- [ ] Cloudinary configuration can be restored
- [ ] Controllers can be reverted to Cloudinary
- [ ] No data loss during rollback process

## Final Verification

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] All functionality works as expected
- [ ] Performance is acceptable
- [ ] Security measures are in place

## Sign-off

- [ ] Development team approval
- [ ] QA team approval (if applicable)
- [ ] Product owner approval
- [ ] Ready for production deployment

---

**Note**: Complete this checklist thoroughly before deploying to production. Any failed tests should be investigated and resolved before proceeding.
