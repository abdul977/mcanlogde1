import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import slug from "slugify";
import Community from "../models/Community.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const communityData = [
  {
    title: "MCAN Scholarship Program",
    description: "Our scholarship initiative has supported over 200 Muslim corps members with educational funding, helping them complete their service year without financial burden while pursuing further education.",
    type: "initiative",
    category: "education",
    content: {
      fullText: "The MCAN Scholarship Program was established to address the financial challenges faced by Muslim corps members during their service year. Through partnerships with Islamic organizations and generous donors, we have been able to provide financial assistance to deserving corps members who demonstrate academic excellence and financial need.",
      excerpt: "Supporting Muslim corps members with educational funding and opportunities for academic advancement.",
      highlights: [
        "Over 200 beneficiaries since inception",
        "Average scholarship amount: ₦150,000 per recipient",
        "95% success rate in program completion",
        "Partnership with 15 Islamic organizations"
      ],
      achievements: [
        {
          title: "Total Scholarships Awarded",
          description: "Number of scholarships provided to corps members",
          date: new Date("2024-12-31"),
          metrics: {
            value: 200,
            unit: "scholarships",
            description: "Cumulative scholarships awarded since program inception"
          }
        },
        {
          title: "Financial Impact",
          description: "Total monetary value of scholarships distributed",
          date: new Date("2024-12-31"),
          metrics: {
            value: 30000000,
            unit: "NGN",
            description: "Total amount disbursed to beneficiaries"
          }
        }
      ]
    },
    participants: {
      featured: [
        {
          name: "Aisha Muhammad",
          role: "Scholarship Recipient 2023",
          bio: "Computer Science graduate who used the scholarship to pursue her Master's degree",
          testimonial: "The MCAN scholarship program changed my life. Without this support, I wouldn't have been able to continue my education. I'm now working as a software engineer and giving back to the community.",
          rating: 5
        },
        {
          name: "Ibrahim Yusuf",
          role: "Scholarship Recipient 2022",
          bio: "Medical student who received support during his service year",
          testimonial: "This program is a blessing. The financial support allowed me to focus on my service and studies without worrying about basic needs.",
          rating: 5
        }
      ],
      totalCount: 200,
      demographics: {
        ageGroups: { youth: 180, adults: 20, seniors: 0 },
        gender: { male: 120, female: 80 }
      }
    },
    timeline: {
      startDate: new Date("2020-01-01"),
      endDate: new Date("2025-12-31"),
      milestones: [
        {
          date: new Date("2020-01-01"),
          title: "Program Launch",
          description: "Official launch of the MCAN Scholarship Program",
          completed: true
        },
        {
          date: new Date("2021-06-01"),
          title: "First 50 Scholarships",
          description: "Awarded scholarships to first 50 beneficiaries",
          completed: true
        },
        {
          date: new Date("2023-01-01"),
          title: "Partnership Expansion",
          description: "Expanded partnerships with Islamic organizations",
          completed: true
        },
        {
          date: new Date("2025-01-01"),
          title: "500 Scholarship Target",
          description: "Goal to reach 500 total scholarships awarded",
          completed: false
        }
      ]
    },
    location: {
      venue: "MCAN Headquarters",
      address: "MCAN Center, Independence Layout",
      city: "Enugu",
      state: "Enugu State"
    },
    impact: {
      beneficiaries: 200,
      metrics: [
        {
          name: "Educational Advancement",
          value: 85,
          unit: "percentage",
          description: "Percentage of recipients who pursued higher education"
        },
        {
          name: "Employment Rate",
          value: 92,
          unit: "percentage",
          description: "Percentage of recipients who found employment within 6 months"
        }
      ],
      outcomes: [
        "Reduced financial stress for corps members",
        "Increased educational attainment",
        "Strengthened Muslim community bonds",
        "Enhanced career prospects for beneficiaries"
      ],
      feedback: {
        positive: 195,
        neutral: 3,
        negative: 2,
        averageRating: 4.8
      }
    },
    tags: ["scholarship", "education", "financial-aid", "youth-development"],
    featured: true,
    priority: "high",
    status: "published",
    visibility: "public"
  },
  {
    title: "Community Iftar Program",
    description: "Annual Ramadan initiative bringing together Muslim corps members and local community for daily iftar meals, fostering unity and spiritual growth during the holy month.",
    type: "initiative",
    category: "spiritual",
    content: {
      fullText: "The Community Iftar Program is our flagship Ramadan initiative that has been running for over 5 years. Every evening during Ramadan, we organize communal iftar meals that bring together Muslim corps members, local community members, and visitors. The program serves as a platform for spiritual reflection, community bonding, and cultural exchange.",
      excerpt: "Daily iftar meals during Ramadan fostering community unity and spiritual growth.",
      highlights: [
        "Over 1,500 people served daily during Ramadan",
        "30 days of continuous service",
        "Volunteer network of 100+ community members",
        "Free meals for all attendees"
      ]
    },
    participants: {
      featured: [
        {
          name: "Ustadh Ahmad Hassan",
          role: "Program Coordinator",
          bio: "Religious leader and community organizer",
          testimonial: "This program embodies the true spirit of Ramadan - sharing, caring, and community building.",
          rating: 5
        }
      ],
      totalCount: 1500,
      demographics: {
        ageGroups: { youth: 600, adults: 750, seniors: 150 },
        gender: { male: 800, female: 700 }
      }
    },
    timeline: {
      startDate: new Date("2024-03-11"),
      endDate: new Date("2024-04-09"),
      milestones: [
        {
          date: new Date("2024-03-11"),
          title: "Ramadan Begins",
          description: "First iftar of the season",
          completed: true
        },
        {
          date: new Date("2024-04-09"),
          title: "Ramadan Ends",
          description: "Final iftar and program conclusion",
          completed: true
        }
      ]
    },
    location: {
      venue: "MCAN Community Hall",
      address: "MCAN Center, Independence Layout",
      city: "Enugu",
      state: "Enugu State"
    },
    impact: {
      beneficiaries: 1500,
      metrics: [
        {
          name: "Daily Attendance",
          value: 150,
          unit: "people",
          description: "Average daily attendance during Ramadan"
        },
        {
          name: "Meals Served",
          value: 4500,
          unit: "meals",
          description: "Total meals served during the program"
        }
      ],
      outcomes: [
        "Strengthened community bonds",
        "Enhanced spiritual experience",
        "Cultural exchange and learning",
        "Support for those in need"
      ],
      feedback: {
        positive: 1450,
        neutral: 40,
        negative: 10,
        averageRating: 4.9
      }
    },
    tags: ["ramadan", "iftar", "community", "spiritual", "unity"],
    featured: true,
    priority: "high",
    status: "published",
    visibility: "public"
  },
  {
    title: "Youth Leadership Development",
    description: "Comprehensive leadership training program for young Muslim corps members, focusing on Islamic leadership principles, community service, and professional development.",
    type: "initiative",
    category: "youth",
    content: {
      fullText: "The Youth Leadership Development program is designed to nurture the next generation of Muslim leaders. Through workshops, mentorship, and practical projects, participants develop leadership skills grounded in Islamic values while gaining practical experience in community service and professional development.",
      excerpt: "Training young Muslims to become effective leaders in their communities and professions.",
      highlights: [
        "6-month intensive program",
        "50+ participants per cohort",
        "Mentorship from established leaders",
        "Real community projects"
      ]
    },
    participants: {
      featured: [
        {
          name: "Fatima Al-Zahra",
          role: "Program Graduate",
          bio: "Now leading her own community initiative",
          testimonial: "This program taught me that leadership in Islam is about service to others. I've applied these principles in my career and community work.",
          rating: 5
        }
      ],
      totalCount: 150,
      demographics: {
        ageGroups: { youth: 150, adults: 0, seniors: 0 },
        gender: { male: 75, female: 75 }
      }
    },
    timeline: {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      milestones: [
        {
          date: new Date("2024-03-01"),
          title: "First Cohort Graduation",
          description: "Completion of first leadership cohort",
          completed: true
        },
        {
          date: new Date("2024-09-01"),
          title: "Second Cohort Launch",
          description: "Beginning of second leadership cohort",
          completed: false
        }
      ]
    },
    impact: {
      beneficiaries: 150,
      metrics: [
        {
          name: "Leadership Positions",
          value: 45,
          unit: "positions",
          description: "Number of graduates who took on leadership roles"
        }
      ],
      outcomes: [
        "Enhanced leadership capabilities",
        "Stronger Islamic identity",
        "Increased community engagement",
        "Professional development"
      ],
      feedback: {
        positive: 140,
        neutral: 8,
        negative: 2,
        averageRating: 4.7
      }
    },
    tags: ["youth", "leadership", "development", "training", "mentorship"],
    featured: false,
    priority: "medium",
    status: "published",
    visibility: "public"
  }
];

async function seedCommunity() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing community items
    await Community.deleteMany({});
    console.log('Cleared existing community items');

    // Add slugs to community data
    const communityWithSlugs = communityData.map(item => ({
      ...item,
      slug: slug(item.title, { lower: true, strict: true })
    }));

    // Insert new community items
    const insertedItems = await Community.insertMany(communityWithSlugs);
    console.log(`Inserted ${insertedItems.length} community items successfully`);

    // Display inserted items
    insertedItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.type}) - ${item.category}`);
    });

    console.log('\nCommunity seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding community items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seeding function
seedCommunity();
