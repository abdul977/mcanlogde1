# Supabase Storage Migration Guide

This document outlines the migration from Cloudinary to Supabase Storage for the MCAN Lodge project.

## Migration Overview

The project has been successfully migrated from Cloudinary to Supabase Storage for all image and file uploads. This provides better integration with the existing Supabase ecosystem and improved performance.

## What Changed

### 1. Dependencies
- **Removed**: `cloudinary` package
- **Added**: `@supabase/supabase-js` package

### 2. Configuration
- **Removed**: `server/src/config/cloudinary.js`
- **Added**: `server/src/config/supabase.js`
- **Updated**: Environment variables in `.env` and `.env.example`

### 3. Storage Service
- **Added**: `server/src/services/supabaseStorage.js` - Comprehensive storage utility

### 4. Controllers Updated
All controllers have been migrated to use Supabase Storage:
- `Donation.js` - Multiple image uploads for donations
- `Post.js` - Accommodation images (3 images per post)
- `Community.js` - Event images and participant photos
- `Resource.js` - Files, thumbnails, and author images
- `Service.js` - Service images
- `QuranClass.js` - Class and instructor images
- `Contribute.js` - Contribution images

## Required Supabase Storage Buckets

The following storage buckets need to be created in your Supabase project:

1. **mcan-donations** - For donation images
2. **mcan-posts** - For accommodation post images
3. **mcan-community** - For community event images
4. **mcan-resources** - For resource files and documents
5. **mcan-services** - For service images
6. **mcan-quran-classes** - For Quran class images
7. **mcan-authors** - For author and instructor images
8. **mcan-participants** - For participant images
9. **mcan-thumbnails** - For thumbnail images

### Creating Buckets

You can create these buckets either:

1. **Via Supabase Dashboard**:
   - Go to Storage in your Supabase dashboard
   - Click "New bucket"
   - Set bucket name and make it public
   - Repeat for all buckets

2. **Via Script** (if you have proper permissions):
   ```bash
   cd server
   node src/scripts/setupSupabaseBuckets.js
   ```

## Environment Variables

### Required Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Legacy Variables (can be removed after testing)
```env
# Cloudinary Configuration (Legacy)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## API Compatibility

The migration maintains full API compatibility. All existing endpoints continue to work exactly the same way:
- Same request formats
- Same response formats
- Same error handling
- Same field names

## File Organization

Files are organized in Supabase Storage with the following structure:
```
mcan-donations/
  └── donations/
      └── timestamp_random_filename.ext

mcan-posts/
  └── accommodations/
      └── timestamp_random_filename.ext

mcan-community/
  └── events/
      └── timestamp_random_filename.ext

mcan-participants/
  └── community/
      └── timestamp_random_filename.ext

mcan-resources/
  └── files/
      └── timestamp_random_filename.ext

mcan-thumbnails/
  └── resources/
      └── timestamp_random_filename.ext

mcan-authors/
  ├── resources/
  │   └── timestamp_random_filename.ext
  └── instructors/
      └── timestamp_random_filename.ext

mcan-services/
  └── services/
      └── timestamp_random_filename.ext

mcan-quran-classes/
  └── classes/
      └── timestamp_random_filename.ext
```

## Benefits of Migration

1. **Unified Platform**: All services (database, auth, storage) in one platform
2. **Better Integration**: Seamless integration with existing Supabase setup
3. **Cost Efficiency**: More predictable pricing structure
4. **Performance**: Global CDN with edge caching
5. **Security**: Built-in security features and access controls
6. **Scalability**: Automatic scaling based on usage

## Testing

After migration, test the following functionality:
1. Image uploads in all sections (donations, posts, community, etc.)
2. File uploads in resources section
3. Multiple image uploads
4. Image display on frontend
5. Error handling for failed uploads

## Rollback Plan

If needed, you can rollback by:
1. Reinstalling Cloudinary: `npm install cloudinary`
2. Restoring `server/src/config/cloudinary.js`
3. Reverting controller changes
4. Updating environment variables

However, any files uploaded to Supabase during the migration period would need to be manually migrated back to Cloudinary.

## Support

For issues related to this migration:
1. Check Supabase dashboard for storage bucket configuration
2. Verify environment variables are correctly set
3. Check server logs for detailed error messages
4. Ensure all required buckets exist and are public

## Project Information

- **Supabase Account**: stt12@flameoflovedegree.com
- **Project URL**: https://vdqbjdfhcxdkpsdrojtd.supabase.co
- **Frontend**: https://mcanlogde1.vercel.app/
- **Backend**: https://mcanlogde1.onrender.com
