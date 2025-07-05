import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import slug from "slugify";
import Service from "../models/Service.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const servicesData = [
  {
    title: "Accommodation Support",
    description: "Assistance in finding suitable and halal accommodation for Muslim corps members",
    icon: "FaHome",
    features: ["Lodge Recommendations", "Area Guidance", "Roommate Matching"],
    category: "accommodation",
    status: "active",
    displayOrder: 1,
    contactInfo: {
      email: "accommodation@mcanenugu.org.ng",
      phone: "+234-XXX-XXX-XXXX",
      department: "Accommodation Committee"
    },
    eligibility: ["Active NYSC Corps Members", "Muslim faith", "Valid NYSC ID"],
    requirements: ["NYSC Call-up Letter", "Valid ID", "Passport Photograph"],
    applicationProcess: "Contact the accommodation committee through the provided channels. Submit required documents and await lodge assignment based on availability and location preference."
  },
  {
    title: "Islamic Education",
    description: "Regular classes and workshops to enhance Islamic knowledge",
    icon: "FaBookReader",
    features: ["Quran Classes", "Islamic Studies", "Arabic Language"],
    category: "education",
    status: "active",
    displayOrder: 2,
    contactInfo: {
      email: "education@mcanenugu.org.ng",
      phone: "+234-XXX-XXX-XXXX",
      department: "Education Committee"
    },
    eligibility: ["All Muslims", "Interest in Islamic learning"],
    requirements: ["Registration form", "Commitment to attend classes"],
    applicationProcess: "Register for classes through the education committee. Choose your preferred schedule and level of study."
  },
  {
    title: "Prayer Facilities",
    description: "Information about mosques and prayer spaces near service locations",
    icon: "FaPray",
    features: ["Mosque Directory", "Prayer Timetable", "Jumu'ah Arrangements"],
    category: "spiritual",
    status: "active",
    displayOrder: 3,
    contactInfo: {
      email: "spiritual@mcanenugu.org.ng",
      phone: "+234-XXX-XXX-XXXX",
      department: "Spiritual Committee"
    },
    eligibility: ["All Muslims"],
    requirements: ["None"],
    applicationProcess: "Contact the spiritual committee for information about nearby mosques and prayer facilities in your service location."
  },
  {
    title: "Career Development",
    description: "Professional development support for corps members",
    icon: "FaGraduationCap",
    features: ["CV Writing", "Interview Tips", "Networking Events"],
    category: "career",
    status: "active",
    displayOrder: 4,
    contactInfo: {
      email: "career@mcanenugu.org.ng",
      phone: "+234-XXX-XXX-XXXX",
      department: "Career Development Committee"
    },
    eligibility: ["NYSC Corps Members", "Recent graduates"],
    requirements: ["Current CV", "Career goals statement"],
    applicationProcess: "Submit your CV and career goals to the career development committee. Attend scheduled workshops and networking events."
  },
  {
    title: "Welfare Support",
    description: "Assistance for corps members facing challenges during service year",
    icon: "FaHandsHelping",
    features: ["Financial Aid", "Health Support", "Emergency Assistance"],
    category: "welfare",
    status: "active",
    displayOrder: 5,
    contactInfo: {
      email: "welfare@mcanenugu.org.ng",
      phone: "+234-XXX-XXX-XXXX",
      department: "Welfare Committee"
    },
    eligibility: ["NYSC Corps Members in need", "Documented challenges"],
    requirements: ["Application form", "Supporting documents", "Recommendation letter"],
    applicationProcess: "Submit a detailed application explaining your situation with supporting documents. The welfare committee will review and respond within 7 working days."
  },
  {
    title: "Marriage Services",
    description: "Support for corps members seeking halal marriage",
    icon: "FaHeart",
    features: ["Marriage Counseling", "Partner Matching", "Nikah Services"],
    category: "social",
    status: "active",
    displayOrder: 6,
    contactInfo: {
      email: "marriage@mcanenugu.org.ng",
      phone: "+234-XXX-XXX-XXXX",
      department: "Marriage Committee"
    },
    eligibility: ["Single Muslims", "Age 18 and above", "Serious marriage intentions"],
    requirements: ["Registration form", "Character reference", "Medical certificate"],
    applicationProcess: "Complete the marriage registration form and attend counseling sessions. The committee will facilitate introductions based on compatibility."
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Add slugs to services data
    const servicesWithSlugs = servicesData.map(service => ({
      ...service,
      slug: slug(service.title, { lower: true, strict: true })
    }));

    // Insert new services
    const insertedServices = await Service.insertMany(servicesWithSlugs);
    console.log(`Inserted ${insertedServices.length} services successfully`);

    // Display inserted services
    insertedServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (${service.category})`);
    });

    console.log('\nServices seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seeding function
seedServices();
