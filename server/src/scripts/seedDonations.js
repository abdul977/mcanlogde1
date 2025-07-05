import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import slug from "slugify";
import Donation from "../models/Donation.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const donationsData = [
  {
    title: "Lodge Sponsorship Program 2025",
    description: "Help provide comfortable and affordable accommodation for Muslim corps members during their service year. Your sponsorship will directly support lodge facilities, utilities, and maintenance.",
    type: "lodge_sponsorship",
    category: "accommodation",
    sponsorshipLevel: "gold",
    amount: {
      target: 5000000,
      raised: 1250000,
      currency: "NGN",
      breakdown: [
        { item: "Lodge Rent (12 months)", cost: 2400000, description: "Annual rent for 3 lodge facilities" },
        { item: "Utilities & Maintenance", cost: 1200000, description: "Electricity, water, internet, and repairs" },
        { item: "Furniture & Equipment", cost: 800000, description: "Beds, mattresses, study tables, and appliances" },
        { item: "Security & Safety", cost: 400000, description: "Security services and safety equipment" },
        { item: "Administrative Costs", cost: 200000, description: "Management and coordination expenses" }
      ]
    },
    sponsorshipTiers: [
      {
        name: "Bronze Sponsor",
        amount: 50000,
        benefits: ["Recognition on lodge notice board", "Certificate of appreciation", "Annual report"],
        maxSponsors: 20,
        currentSponsors: 8,
        color: "#CD7F32"
      },
      {
        name: "Silver Sponsor",
        amount: 100000,
        benefits: ["Recognition on lodge notice board", "Certificate of appreciation", "Annual report", "Lodge naming rights (room)"],
        maxSponsors: 10,
        currentSponsors: 5,
        color: "#C0C0C0"
      },
      {
        name: "Gold Sponsor",
        amount: 250000,
        benefits: ["Recognition on lodge notice board", "Certificate of appreciation", "Annual report", "Lodge naming rights (facility)", "VIP invitation to events"],
        maxSponsors: 5,
        currentSponsors: 2,
        color: "#FFD700"
      }
    ],
    timeline: {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      milestones: [
        {
          date: new Date("2025-03-31"),
          title: "25% Target Reached",
          description: "First quarter fundraising goal",
          targetAmount: 1250000,
          achieved: true
        },
        {
          date: new Date("2025-06-30"),
          title: "50% Target Reached",
          description: "Mid-year fundraising goal",
          targetAmount: 2500000,
          achieved: false
        },
        {
          date: new Date("2025-12-31"),
          title: "Full Target Achieved",
          description: "Complete funding secured",
          targetAmount: 5000000,
          achieved: false
        }
      ]
    },
    beneficiaries: {
      target: 150,
      current: 45,
      demographics: {
        corpsMembers: 150,
        families: 0,
        students: 0,
        general: 0
      }
    },
    sponsors: [
      {
        name: "Alhaji Musa Ibrahim",
        email: "musa.ibrahim@email.com",
        phone: "+234-803-123-4567",
        organization: "Ibrahim Foundation",
        amount: 250000,
        tier: "Gold Sponsor",
        isAnonymous: false,
        message: "May Allah bless this initiative and all beneficiaries",
        paymentMethod: "bank_transfer",
        paymentReference: "TXN-2025-001",
        paymentStatus: "confirmed",
        donationDate: new Date("2025-01-15"),
        receiptNumber: "MCAN-2025-001"
      },
      {
        name: "Dr. Fatima Al-Zahra",
        email: "fatima.alzahra@email.com",
        phone: "+234-806-987-6543",
        organization: "Medical Professionals Association",
        amount: 100000,
        tier: "Silver Sponsor",
        isAnonymous: false,
        message: "Supporting our young Muslims in service",
        paymentMethod: "card",
        paymentReference: "TXN-2025-002",
        paymentStatus: "confirmed",
        donationDate: new Date("2025-01-20"),
        receiptNumber: "MCAN-2025-002"
      }
    ],
    paymentInfo: {
      bankDetails: {
        accountName: "Muslim Corps Members Association of Nigeria",
        accountNumber: "1234567890",
        bankName: "First Bank of Nigeria",
        sortCode: "011"
      },
      mobilePayment: {
        number: "+234-803-MCAN-123",
        provider: "mtn"
      }
    },
    tags: ["lodge", "sponsorship", "accommodation", "corps-members"],
    featured: true,
    urgent: false,
    status: "active",
    visibility: "public"
  },
  {
    title: "Emergency Welfare Fund",
    description: "Immediate financial assistance for corps members facing unexpected hardships, medical emergencies, or urgent personal challenges during their service year.",
    type: "emergency_fund",
    category: "welfare",
    amount: {
      target: 2000000,
      raised: 450000,
      currency: "NGN",
      breakdown: [
        { item: "Medical Emergency Support", cost: 800000, description: "Healthcare costs and medical bills" },
        { item: "Family Emergency Assistance", cost: 600000, description: "Support for family crises" },
        { item: "Transportation Emergency", cost: 300000, description: "Emergency travel and transportation" },
        { item: "Basic Needs Support", cost: 200000, description: "Food, clothing, and essential items" },
        { item: "Administrative Reserve", cost: 100000, description: "Fund management and processing" }
      ]
    },
    timeline: {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      milestones: [
        {
          date: new Date("2025-04-30"),
          title: "Initial Fund Establishment",
          description: "Establish emergency response capability",
          targetAmount: 500000,
          achieved: false
        },
        {
          date: new Date("2025-08-31"),
          title: "Mid-Year Review",
          description: "Assess fund utilization and needs",
          targetAmount: 1000000,
          achieved: false
        }
      ]
    },
    beneficiaries: {
      target: 100,
      current: 12,
      demographics: {
        corpsMembers: 100,
        families: 20,
        students: 0,
        general: 0
      }
    },
    sponsors: [
      {
        name: "Anonymous Donor",
        amount: 200000,
        isAnonymous: true,
        message: "May Allah ease the difficulties of our brothers and sisters",
        paymentMethod: "bank_transfer",
        paymentReference: "TXN-2025-003",
        paymentStatus: "confirmed",
        donationDate: new Date("2025-02-01"),
        receiptNumber: "MCAN-2025-003"
      }
    ],
    paymentInfo: {
      bankDetails: {
        accountName: "MCAN Emergency Welfare Fund",
        accountNumber: "9876543210",
        bankName: "Access Bank",
        sortCode: "044"
      }
    },
    tags: ["emergency", "welfare", "medical", "assistance"],
    featured: false,
    urgent: true,
    status: "active",
    visibility: "public"
  },
  {
    title: "Islamic Education Scholarship Fund",
    description: "Supporting Muslim corps members pursuing further Islamic education, Arabic language studies, and religious scholarship programs.",
    type: "scholarship_fund",
    category: "education",
    amount: {
      target: 3000000,
      raised: 750000,
      currency: "NGN",
      breakdown: [
        { item: "University Scholarships", cost: 1500000, description: "Tuition support for Islamic studies programs" },
        { item: "Arabic Language Courses", cost: 600000, description: "Intensive Arabic learning programs" },
        { item: "Religious Certification", cost: 450000, description: "Islamic scholarship and certification courses" },
        { item: "Books and Materials", cost: 300000, description: "Educational resources and textbooks" },
        { item: "Program Administration", cost: 150000, description: "Scholarship management and coordination" }
      ]
    },
    timeline: {
      startDate: new Date("2025-02-01"),
      endDate: new Date("2026-01-31"),
      milestones: [
        {
          date: new Date("2025-05-31"),
          title: "First Scholarship Awards",
          description: "Award initial scholarships to qualified candidates",
          targetAmount: 1000000,
          achieved: false
        },
        {
          date: new Date("2025-09-30"),
          title: "Mid-Program Review",
          description: "Evaluate program effectiveness and impact",
          targetAmount: 2000000,
          achieved: false
        }
      ]
    },
    beneficiaries: {
      target: 50,
      current: 8,
      demographics: {
        corpsMembers: 40,
        families: 0,
        students: 50,
        general: 0
      }
    },
    sponsors: [
      {
        name: "Islamic Education Foundation",
        email: "info@islamiceducation.org",
        organization: "Islamic Education Foundation",
        amount: 500000,
        tier: "Major Donor",
        isAnonymous: false,
        message: "Investing in the Islamic education of our youth",
        paymentMethod: "bank_transfer",
        paymentReference: "TXN-2025-004",
        paymentStatus: "confirmed",
        donationDate: new Date("2025-02-10"),
        receiptNumber: "MCAN-2025-004"
      }
    ],
    paymentInfo: {
      bankDetails: {
        accountName: "MCAN Education Fund",
        accountNumber: "5555666677",
        bankName: "Zenith Bank",
        sortCode: "057"
      }
    },
    tags: ["education", "scholarship", "islamic-studies", "arabic"],
    featured: true,
    urgent: false,
    status: "active",
    visibility: "public"
  }
];

async function seedDonations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing donations
    await Donation.deleteMany({});
    console.log('Cleared existing donations');

    // Add slugs to donations data
    const donationsWithSlugs = donationsData.map(donation => ({
      ...donation,
      slug: slug(donation.title, { lower: true, strict: true })
    }));

    // Insert new donations
    const insertedDonations = await Donation.insertMany(donationsWithSlugs);
    console.log(`Inserted ${insertedDonations.length} donations successfully`);

    // Display inserted donations
    insertedDonations.forEach((donation, index) => {
      console.log(`${index + 1}. ${donation.title} (${donation.type}) - Target: ${donation.amount.currency} ${donation.amount.target.toLocaleString()}`);
    });

    console.log('\nDonations seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding donations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seeding function
seedDonations();
