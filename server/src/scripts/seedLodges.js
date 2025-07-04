import { connectToDb } from '../config/db.js';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import slug from 'slugify';
import mongoose from 'mongoose';

async function seedData() {
  let connection;
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    connection = await connectToDb();
    console.log('Connected successfully to MongoDB');

    // Create Shared Accommodation category
    console.log('Creating Shared Accommodation category...');
    const sharedCategory = await Category.findOneAndUpdate(
      { name: 'Shared Accommodation' },
      {
        name: 'Shared Accommodation',
        description: 'Affordable shared living spaces for corps members',
        icon: 'users',
        features: [
          'Shared facilities',
          'Community living',
          'Cost-effective',
          'Prayer spaces'
        ],
        slug: slug('Shared Accommodation', { lower: true })
      },
      { upsert: true, new: true }
    );
    console.log('Category created:', sharedCategory._id);

    // Base lodge data template
    console.log('Preparing lodge data...');
    const baseLodgeData = {
      accommodationType: "Shared Apartment",
      location: "Kubwa, Abuja",
      category: sharedCategory._id,
      isAvailable: true,
      price: 15000, // Monthly price per bed space in Naira
      mosqueProximity: 500, // 500 meters to nearest mosque
      prayerFacilities: true,
      nearbyFacilities: {
        mosques: [
          { name: "Kubwa Central Mosque", distance: 500 }
        ],
        halalRestaurants: [
          { name: "Local Halal Restaurant", distance: 200 }
        ],
        islamicCenters: [
          { name: "MCAN Kubwa Center", distance: 0 }
        ]
      },
      nearArea: [
        "Kubwa NYSC Camp",
        "Central Market",
        "Hospital",
        "Transport Hub"
      ],
      facilities: [
        "Bunk Beds",
        "Shared Kitchen",
        "Prayer Room",
        "Study Area",
        "Security",
        "Water Supply"
      ],
      rules: [
        "Maintain Islamic etiquette",
        "Respect prayer times",
        "Keep facilities clean",
        "No mixing of non-mahrams",
        "Observe quiet hours"
      ],
      images: [
        "https://example.com/room-1.jpg",
        "https://example.com/room-2.jpg",
        "https://example.com/room-3.jpg"
      ],
      landlordContact: {
        name: "MCAN Housing Coordinator",
        phone: "+234XXXXXXXXX",
        preferredContactTime: "8:00 AM - 8:00 PM"
      }
    };

    // Create entries for each room in the brothers' section (5 rooms, max 6 guests each)
    const brothersRooms = Array.from({ length: 5 }, (_, roomIndex) => ({
      ...baseLodgeData,
      title: `MCAN Kubwa Camp Lodge - Brothers Room ${roomIndex + 1}`,
      description: `Brothers' shared room in MCAN's dedicated accommodation facility near Kubwa camp. Features include:
- Shared living space for up to 6 brothers
- Common prayer area
- 24/7 security
- Clean and well-maintained facilities
- Access to Islamic resources and community activities
- Room ${roomIndex + 1} of 5`,
      genderRestriction: "brothers",
      guest: 6,
      slug: slug(`MCAN Kubwa Camp Lodge Brothers Room ${roomIndex + 1}`, { lower: true }),
    }));

    // Create entries for each room in the sisters' section (5 rooms, max 6 guests each)
    const sistersRooms = Array.from({ length: 5 }, (_, roomIndex) => ({
      ...baseLodgeData,
      title: `MCAN Kubwa Camp Lodge - Sisters Room ${roomIndex + 1}`,
      description: `Sisters' shared room in MCAN's dedicated accommodation facility near Kubwa camp. Features include:
- Secured living space for up to 6 sisters
- Private prayer area
- Female security personnel
- Clean and well-maintained facilities
- Access to Islamic resources and sisterhood activities
- Room ${roomIndex + 1} of 5`,
      genderRestriction: "sisters",
      guest: 6,
      slug: slug(`MCAN Kubwa Camp Lodge Sisters Room ${roomIndex + 1}`, { lower: true }),
    }));

    // Delete existing entries
    console.log('Deleting existing entries...');
    const deleteResult = await Post.deleteMany({ 
      location: "Kubwa, Abuja",
      accommodationType: "Shared Apartment"
    });
    console.log(`Deleted ${deleteResult.deletedCount} existing entries`);

    // Insert all rooms
    console.log('Inserting new rooms...');
    const insertResult = await Post.insertMany([...brothersRooms, ...sistersRooms], { 
      ordered: false,
      rawResult: true 
    });

    console.log('\nSuccessfully seeded Kubwa camp lodge data!');
    console.log(`Added ${brothersRooms.length} brothers' rooms (${brothersRooms.length * 6} bed spaces)`);
    console.log(`Added ${sistersRooms.length} sisters' rooms (${sistersRooms.length * 6} bed spaces)`);
    console.log('Total rooms:', brothersRooms.length + sistersRooms.length);
    console.log('Total bed spaces:', (brothersRooms.length + sistersRooms.length) * 6);

  } catch (error) {
    console.error('\nError seeding data:', error);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  } finally {
    // Close database connection
    if (connection) {
      console.log('Closing database connection...');
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// Run the seed function
console.log('Starting seed process...');
seedData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});