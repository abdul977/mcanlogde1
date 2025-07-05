import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import slug from "slugify";
import QuranClass from "../models/QuranClass.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const quranClassesData = [
  {
    title: "Tajweed Mastery Program",
    description: "Master the art of beautiful Quranic recitation with proper pronunciation, rhythm, and rules of Tajweed. This comprehensive program covers all essential Tajweed rules with practical application.",
    program: "tajweed",
    level: "beginner",
    instructor: {
      name: "Qari Muhammad Abdullahi",
      title: "Certified Qari and Tajweed Instructor",
      qualifications: ["Ijazah in Quranic Recitation", "10+ years teaching experience", "Hafs an Asim certification"],
      bio: "Qari Muhammad has been teaching Tajweed for over a decade and holds multiple Ijazahs in Quranic recitation."
    },
    schedule: {
      frequency: "weekly",
      daysOfWeek: ["tuesday", "thursday"],
      time: "18:00",
      duration: 90,
      startDate: new Date("2025-07-15T18:00:00Z"),
      endDate: new Date("2025-12-15T18:00:00Z")
    },
    venue: {
      name: "MCAN Quran Hall",
      address: "MCAN Center, Enugu",
      capacity: 30,
      isOnline: false,
      requirements: ["Mushaf (Quran)", "Notebook", "Pen"]
    },
    curriculum: {
      objectives: [
        "Master basic Tajweed rules",
        "Improve Quranic pronunciation",
        "Develop beautiful recitation style",
        "Understand makharij (articulation points)"
      ],
      topics: [
        {
          week: 1,
          title: "Introduction to Tajweed",
          description: "Basic concepts and importance of Tajweed",
          verses: [
            { surah: "Al-Muzzammil", ayah: "4", text: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا" }
          ]
        },
        {
          week: 2,
          title: "Makharij al-Huruf (Articulation Points)",
          description: "Learning the correct pronunciation points for Arabic letters"
        },
        {
          week: 3,
          title: "Sifat al-Huruf (Characteristics of Letters)",
          description: "Understanding the qualities and characteristics of Arabic letters"
        }
      ],
      materials: [
        {
          title: "Tajweed Rules Handbook",
          type: "pdf",
          url: "/materials/tajweed-handbook.pdf",
          isRequired: true
        },
        {
          title: "Audio Recitation Examples",
          type: "audio",
          url: "/materials/tajweed-audio.mp3",
          isRequired: false
        }
      ]
    },
    prerequisites: ["Basic Arabic reading ability", "Familiarity with Arabic alphabet"],
    targetAudience: {
      ageGroup: "adults",
      gender: "mixed",
      experience: "basic"
    },
    fees: {
      amount: 5000,
      currency: "NGN",
      paymentSchedule: "monthly",
      scholarshipAvailable: true
    },
    enrollment: {
      isOpen: true,
      maxStudents: 25,
      currentStudents: 12,
      registrationDeadline: new Date("2025-07-10T23:59:59Z"),
      requirements: ["Registration form", "Payment confirmation", "Basic Arabic test"]
    },
    status: "published",
    tags: ["tajweed", "recitation", "quran", "pronunciation"],
    language: "english"
  },
  {
    title: "Quran Memorization (Hifz) Program",
    description: "Systematic Quran memorization program designed for dedicated students. Learn effective memorization techniques, revision methods, and maintain long-term retention of the Holy Quran.",
    program: "memorization",
    level: "intermediate",
    instructor: {
      name: "Hafiz Ibrahim Yusuf",
      title: "Hafiz and Memorization Specialist",
      qualifications: ["Complete Quran memorization", "15+ years teaching Hifz", "Advanced Tajweed certification"],
      bio: "Hafiz Ibrahim has guided over 100 students to complete their Quran memorization with proven techniques."
    },
    schedule: {
      frequency: "daily",
      daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      time: "06:00",
      duration: 120,
      startDate: new Date("2025-07-20T06:00:00Z"),
      endDate: new Date("2027-07-20T06:00:00Z")
    },
    venue: {
      name: "MCAN Hifz Center",
      address: "MCAN Center, Enugu",
      capacity: 20,
      isOnline: false,
      requirements: ["Personal Mushaf", "Memorization notebook", "Daily commitment"]
    },
    curriculum: {
      objectives: [
        "Memorize assigned portions of the Quran",
        "Develop effective memorization techniques",
        "Maintain strong revision schedule",
        "Build spiritual connection with the Quran"
      ],
      topics: [
        {
          week: 1,
          title: "Memorization Techniques",
          description: "Learning effective methods for Quran memorization"
        },
        {
          week: 2,
          title: "Starting with Short Surahs",
          description: "Beginning memorization with Juz Amma"
        }
      ],
      materials: [
        {
          title: "Hifz Progress Tracker",
          type: "pdf",
          url: "/materials/hifz-tracker.pdf",
          isRequired: true
        }
      ],
      assessments: [
        {
          type: "memorization",
          title: "Weekly Memorization Test",
          week: 1,
          weight: 100
        }
      ]
    },
    prerequisites: ["Strong Arabic reading skills", "Basic Tajweed knowledge", "Daily time commitment (2+ hours)"],
    targetAudience: {
      ageGroup: "youth",
      gender: "mixed",
      experience: "intermediate"
    },
    fees: {
      amount: 10000,
      currency: "NGN",
      paymentSchedule: "monthly",
      scholarshipAvailable: true
    },
    enrollment: {
      isOpen: true,
      maxStudents: 15,
      currentStudents: 8,
      registrationDeadline: new Date("2025-07-15T23:59:59Z"),
      requirements: ["Entrance assessment", "Commitment letter", "Parent/guardian consent (if under 18)"]
    },
    status: "published",
    tags: ["memorization", "hifz", "quran", "intensive"],
    language: "english"
  },
  {
    title: "Tafseer Study Circle",
    description: "Deep dive into Quranic interpretation and understanding. Study classical and contemporary Tafseer works to gain comprehensive understanding of Quranic verses, their context, and application.",
    program: "tafseer",
    level: "advanced",
    instructor: {
      name: "Dr. Amina Hassan",
      title: "Islamic Studies Scholar",
      qualifications: ["PhD in Islamic Studies", "Specialization in Quranic Exegesis", "Author of Tafseer works"],
      bio: "Dr. Amina is a renowned scholar with expertise in classical and modern Tafseer methodologies."
    },
    schedule: {
      frequency: "weekly",
      daysOfWeek: ["saturday"],
      time: "14:00",
      duration: 150,
      startDate: new Date("2025-07-12T14:00:00Z"),
      endDate: new Date("2026-07-12T14:00:00Z")
    },
    venue: {
      name: "MCAN Study Hall",
      address: "MCAN Center, Enugu",
      capacity: 40,
      isOnline: true,
      onlineLink: "https://zoom.us/j/tafseer-study",
      requirements: ["Quran with translation", "Tafseer reference books", "Note-taking materials"]
    },
    curriculum: {
      objectives: [
        "Understand Quranic verses in context",
        "Learn classical Tafseer methodologies",
        "Apply Quranic teachings to modern life",
        "Develop analytical thinking about Quranic text"
      ],
      topics: [
        {
          week: 1,
          title: "Introduction to Tafseer",
          description: "Principles and methodologies of Quranic interpretation",
          verses: [
            { surah: "Al-Baqarah", ayah: "2", text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ" }
          ]
        }
      ],
      materials: [
        {
          title: "Tafseer Ibn Kathir (Selected Portions)",
          type: "book",
          isRequired: true
        },
        {
          title: "Contemporary Tafseer Resources",
          type: "pdf",
          url: "/materials/modern-tafseer.pdf",
          isRequired: false
        }
      ]
    },
    prerequisites: ["Advanced Arabic comprehension", "Basic Islamic knowledge", "Previous Quran study"],
    targetAudience: {
      ageGroup: "adults",
      gender: "mixed",
      experience: "advanced"
    },
    fees: {
      amount: 7500,
      currency: "NGN",
      paymentSchedule: "monthly",
      scholarshipAvailable: true
    },
    enrollment: {
      isOpen: true,
      maxStudents: 35,
      currentStudents: 22,
      registrationDeadline: new Date("2025-07-08T23:59:59Z"),
      requirements: ["Arabic proficiency test", "Previous Islamic studies background", "Research project commitment"]
    },
    status: "published",
    tags: ["tafseer", "interpretation", "advanced", "scholarly"],
    language: "english"
  }
];

async function seedQuranClasses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing Quran classes
    await QuranClass.deleteMany({});
    console.log('Cleared existing Quran classes');

    // Add slugs to classes data
    const classesWithSlugs = quranClassesData.map(quranClass => ({
      ...quranClass,
      slug: slug(quranClass.title, { lower: true, strict: true })
    }));

    // Insert new Quran classes
    const insertedClasses = await QuranClass.insertMany(classesWithSlugs);
    console.log(`Inserted ${insertedClasses.length} Quran classes successfully`);

    // Display inserted classes
    insertedClasses.forEach((quranClass, index) => {
      console.log(`${index + 1}. ${quranClass.title} (${quranClass.program}) - ${quranClass.instructor.name}`);
    });

    console.log('\nQuran classes seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Quran classes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seeding function
seedQuranClasses();
