import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import slug from "slugify";
import Lecture from "../models/Lecture.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const lecturesData = [
  {
    title: "Understanding the Quran: A Beginner's Guide",
    description: "An introductory lecture series designed to help new Muslims and those seeking to deepen their understanding of the Holy Quran. We'll cover basic principles of interpretation, historical context, and practical application in daily life.",
    speaker: {
      name: "Sheikh Abdullah Rahman",
      title: "Islamic Scholar",
      bio: "Sheikh Abdullah has over 15 years of experience in Islamic education and Quranic studies."
    },
    type: "regular",
    schedule: {
      frequency: "weekly",
      dayOfWeek: "friday",
      time: "19:00",
      duration: 90
    },
    topics: ["Quranic Interpretation", "Historical Context", "Daily Application", "Arabic Basics"],
    level: "beginner",
    venue: {
      name: "MCAN Main Hall",
      address: "MCAN Center, Enugu",
      capacity: 100,
      isOnline: false
    },
    prerequisites: ["Basic Islamic knowledge helpful but not required"],
    learningOutcomes: [
      "Understand basic Quranic principles",
      "Learn proper recitation techniques",
      "Apply Quranic teachings in daily life"
    ],
    status: "published",
    registrationRequired: true,
    maxAttendees: 80,
    tags: ["quran", "beginner", "weekly", "islamic-studies"],
    language: "english"
  },
  {
    title: "The Life of Prophet Muhammad (PBUH)",
    description: "A comprehensive study of the life, teachings, and example of Prophet Muhammad (Peace Be Upon Him). This lecture series covers his early life, prophethood, major events, and lasting impact on humanity.",
    speaker: {
      name: "Dr. Fatima Al-Zahra",
      title: "Professor of Islamic History",
      bio: "Dr. Fatima specializes in Islamic history and has authored several books on the Prophet's biography."
    },
    type: "special",
    schedule: {
      frequency: "once",
      time: "15:00",
      duration: 120
    },
    date: new Date("2025-07-15T15:00:00Z"),
    topics: ["Early Life", "Prophethood", "Major Events", "Teachings", "Legacy"],
    level: "all",
    venue: {
      name: "University Auditorium",
      address: "University of Nigeria, Nsukka",
      capacity: 300,
      isOnline: true,
      onlineLink: "https://zoom.us/j/example"
    },
    prerequisites: [],
    learningOutcomes: [
      "Comprehensive understanding of Prophet's life",
      "Learn from his examples and teachings",
      "Apply prophetic guidance in modern life"
    ],
    status: "published",
    registrationRequired: true,
    maxAttendees: 250,
    tags: ["prophet", "biography", "special-event", "history"],
    language: "english"
  },
  {
    title: "Islamic Finance and Economics",
    description: "Understanding Islamic principles of finance, banking, and economics. Learn about halal investment, Islamic banking systems, and how to manage personal finances according to Islamic guidelines.",
    speaker: {
      name: "Ustaz Ibrahim Musa",
      title: "Islamic Finance Expert",
      bio: "Ustaz Ibrahim has worked in Islamic banking for over 10 years and holds certifications in Islamic finance."
    },
    type: "workshop",
    schedule: {
      frequency: "monthly",
      dayOfWeek: "saturday",
      time: "10:00",
      duration: 180
    },
    topics: ["Halal Investment", "Islamic Banking", "Personal Finance", "Business Ethics"],
    level: "intermediate",
    venue: {
      name: "MCAN Conference Room",
      address: "MCAN Center, Enugu",
      capacity: 50,
      isOnline: false
    },
    prerequisites: ["Basic understanding of finance concepts"],
    learningOutcomes: [
      "Understand Islamic finance principles",
      "Learn halal investment strategies",
      "Manage personal finances Islamically"
    ],
    status: "published",
    registrationRequired: true,
    maxAttendees: 40,
    tags: ["finance", "economics", "workshop", "halal"],
    language: "english"
  },
  {
    title: "Arabic Language for Beginners",
    description: "Start your journey in learning the Arabic language. This course covers basic Arabic alphabet, pronunciation, common phrases, and simple sentence construction to help you understand Islamic texts better.",
    speaker: {
      name: "Ustaza Aisha Abdullahi",
      title: "Arabic Language Instructor",
      bio: "Ustaza Aisha is a certified Arabic teacher with experience teaching Arabic to non-native speakers."
    },
    type: "regular",
    schedule: {
      frequency: "weekly",
      dayOfWeek: "tuesday",
      time: "18:30",
      duration: 60
    },
    topics: ["Arabic Alphabet", "Pronunciation", "Basic Vocabulary", "Simple Sentences"],
    level: "beginner",
    venue: {
      name: "MCAN Classroom 1",
      address: "MCAN Center, Enugu",
      capacity: 30,
      isOnline: false
    },
    prerequisites: [],
    learningOutcomes: [
      "Read Arabic alphabet",
      "Pronounce Arabic words correctly",
      "Understand basic Arabic phrases",
      "Construct simple sentences"
    ],
    status: "published",
    registrationRequired: true,
    maxAttendees: 25,
    tags: ["arabic", "language", "beginner", "weekly"],
    language: "english"
  },
  {
    title: "Islamic Ethics in Modern Society",
    description: "Exploring how Islamic ethical principles apply to contemporary challenges. Discuss topics like social media ethics, workplace conduct, environmental responsibility, and community engagement from an Islamic perspective.",
    speaker: {
      name: "Dr. Yusuf Adebayo",
      title: "Islamic Ethics Scholar",
      bio: "Dr. Yusuf specializes in applied Islamic ethics and contemporary Islamic thought."
    },
    type: "seminar",
    schedule: {
      frequency: "once",
      time: "14:00",
      duration: 150
    },
    date: new Date("2025-07-20T14:00:00Z"),
    topics: ["Social Media Ethics", "Workplace Conduct", "Environmental Responsibility", "Community Engagement"],
    level: "intermediate",
    venue: {
      name: "Community Center Hall",
      address: "Independence Layout, Enugu",
      capacity: 150,
      isOnline: true,
      onlineLink: "https://meet.google.com/example"
    },
    prerequisites: ["Basic Islamic knowledge"],
    learningOutcomes: [
      "Apply Islamic ethics to modern challenges",
      "Develop ethical decision-making skills",
      "Understand Islamic perspective on contemporary issues"
    ],
    status: "published",
    registrationRequired: false,
    tags: ["ethics", "modern-society", "seminar", "contemporary"],
    language: "english"
  },
  {
    title: "Women in Islam: Rights and Responsibilities",
    description: "A comprehensive discussion about the status, rights, and responsibilities of women in Islam. Addressing common misconceptions and highlighting the balanced approach Islam takes towards gender roles and women's empowerment.",
    speaker: {
      name: "Ustaza Khadijah Usman",
      title: "Islamic Women's Rights Advocate",
      bio: "Ustaza Khadijah is an advocate for women's rights in Islam and has spoken at numerous conferences on this topic."
    },
    type: "special",
    schedule: {
      frequency: "once",
      time: "16:00",
      duration: 120
    },
    date: new Date("2025-07-25T16:00:00Z"),
    topics: ["Women's Rights in Islam", "Historical Examples", "Modern Applications", "Addressing Misconceptions"],
    level: "all",
    venue: {
      name: "MCAN Women's Hall",
      address: "MCAN Center, Enugu",
      capacity: 80,
      isOnline: false
    },
    prerequisites: [],
    learningOutcomes: [
      "Understand women's status in Islam",
      "Learn about historical female role models",
      "Address common misconceptions",
      "Apply Islamic principles to modern women's issues"
    ],
    status: "published",
    registrationRequired: true,
    maxAttendees: 70,
    tags: ["women", "rights", "special-event", "empowerment"],
    language: "english"
  }
];

async function seedLectures() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing lectures
    await Lecture.deleteMany({});
    console.log('Cleared existing lectures');

    // Add slugs to lectures data
    const lecturesWithSlugs = lecturesData.map(lecture => ({
      ...lecture,
      slug: slug(lecture.title, { lower: true, strict: true })
    }));

    // Insert new lectures
    const insertedLectures = await Lecture.insertMany(lecturesWithSlugs);
    console.log(`Inserted ${insertedLectures.length} lectures successfully`);

    // Display inserted lectures
    insertedLectures.forEach((lecture, index) => {
      console.log(`${index + 1}. ${lecture.title} (${lecture.type}) - ${lecture.speaker.name}`);
    });

    console.log('\nLectures seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding lectures:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seeding function
seedLectures();
