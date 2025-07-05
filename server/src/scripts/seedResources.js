import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import slug from "slugify";
import Resource from "../models/Resource.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const resourcesData = [
  {
    title: "The Noble Quran - English Translation",
    description: "Complete English translation of the Holy Quran by Dr. Muhammad Taqi-ud-Din Al-Hilali and Dr. Muhammad Muhsin Khan. This translation provides clear understanding of the Quranic verses with explanatory notes.",
    category: "books",
    subcategory: "Quran Translations",
    type: "file",
    content: {
      externalUrl: "https://www.islamicfinder.org/quran/",
      fileName: "noble-quran-english.pdf"
    },
    author: {
      name: "Dr. Muhammad Taqi-ud-Din Al-Hilali & Dr. Muhammad Muhsin Khan",
      credentials: ["PhD in Islamic Studies", "Renowned Islamic Scholars"],
      bio: "Renowned Islamic scholars who have contributed significantly to Quranic translation and Islamic literature."
    },
    publisher: {
      name: "Darussalam Publishers",
      website: "https://www.darussalam.com",
      publishedDate: new Date("1996-01-01")
    },
    metadata: {
      language: "english",
      pages: 1000,
      difficulty: "all",
      edition: "Revised Edition"
    },
    topics: ["quran", "translation", "tafseer", "islamic-studies"],
    tags: ["quran", "english", "translation", "darussalam", "reference"],
    preview: {
      excerpt: "This translation of the Quran provides clear and accurate English rendering of the Arabic text, making it accessible to English-speaking Muslims and non-Muslims alike.",
      tableOfContents: [
        { chapter: "Al-Fatihah", page: 1 },
        { chapter: "Al-Baqarah", page: 5 },
        { chapter: "Aal-E-Imran", page: 50 }
      ]
    },
    access: {
      level: "public",
      requiresLogin: false,
      downloadable: true,
      printable: true
    },
    statistics: {
      views: 1250,
      downloads: 890,
      likes: 156,
      shares: 78
    },
    ratings: {
      average: 4.8,
      count: 124
    },
    featured: true,
    status: "published"
  },
  {
    title: "Sahih Al-Bukhari - Complete Collection",
    description: "The most authentic collection of Hadith compiled by Imam Muhammad ibn Ismail al-Bukhari. Contains over 7,000 authentic sayings, actions, and approvals of Prophet Muhammad (PBUH).",
    category: "books",
    subcategory: "Hadith Collections",
    type: "link",
    content: {
      externalUrl: "https://sunnah.com/bukhari"
    },
    author: {
      name: "Imam Muhammad ibn Ismail al-Bukhari",
      credentials: ["Renowned Hadith Scholar", "9th Century Islamic Scholar"],
      bio: "One of the most respected hadith scholars in Islamic history, known for his rigorous authentication methods."
    },
    publisher: {
      name: "Sunnah.com",
      website: "https://sunnah.com",
      publishedDate: new Date("2010-01-01")
    },
    metadata: {
      language: "english",
      difficulty: "intermediate"
    },
    topics: ["hadith", "sunnah", "bukhari", "prophet-muhammad", "islamic-jurisprudence"],
    tags: ["hadith", "bukhari", "sunnah", "authentic", "reference"],
    preview: {
      excerpt: "Sahih al-Bukhari is considered the most authentic book after the Quran. It contains carefully verified traditions of Prophet Muhammad (PBUH)."
    },
    access: {
      level: "public",
      requiresLogin: false,
      downloadable: false,
      printable: false
    },
    statistics: {
      views: 2100,
      downloads: 0,
      likes: 245,
      shares: 134
    },
    ratings: {
      average: 4.9,
      count: 189
    },
    featured: true,
    status: "published"
  },
  {
    title: "Learn Arabic - Beginner's Course",
    description: "Comprehensive Arabic language course designed for beginners. Includes audio lessons, vocabulary building, grammar basics, and practical exercises to help you start reading the Quran in Arabic.",
    category: "courses",
    subcategory: "Language Learning",
    type: "embedded",
    content: {
      embedCode: '<iframe src="https://example.com/arabic-course" width="100%" height="400"></iframe>',
      externalUrl: "https://example.com/arabic-course"
    },
    author: {
      name: "Ustadh Ahmad Al-Masri",
      title: "Arabic Language Instructor",
      credentials: ["MA in Arabic Literature", "15+ years teaching experience"],
      bio: "Experienced Arabic teacher specializing in teaching Arabic to non-native speakers."
    },
    metadata: {
      language: "english",
      duration: 480, // 8 hours
      difficulty: "beginner"
    },
    topics: ["arabic", "language-learning", "grammar", "vocabulary", "pronunciation"],
    tags: ["arabic", "beginner", "course", "language", "online"],
    preview: {
      excerpt: "Start your Arabic learning journey with this structured course that takes you from complete beginner to basic reading proficiency."
    },
    access: {
      level: "public",
      requiresLogin: true,
      downloadable: false,
      printable: false
    },
    statistics: {
      views: 856,
      downloads: 0,
      likes: 98,
      shares: 45
    },
    ratings: {
      average: 4.6,
      count: 67
    },
    featured: false,
    status: "published"
  },
  {
    title: "Islamic Finance Principles",
    description: "Comprehensive guide to Islamic banking and finance principles. Covers Sharia-compliant investment options, Islamic banking concepts, and practical applications in modern financial systems.",
    category: "documents",
    subcategory: "Finance & Economics",
    type: "file",
    content: {
      externalUrl: "https://example.com/islamic-finance.pdf",
      fileName: "islamic-finance-principles.pdf"
    },
    author: {
      name: "Dr. Abdullah Al-Mansouri",
      title: "Islamic Finance Expert",
      credentials: ["PhD in Islamic Economics", "Certified Islamic Finance Professional"],
      bio: "Leading expert in Islamic finance with over 20 years of experience in Islamic banking and investment."
    },
    publisher: {
      name: "Islamic Finance Institute",
      website: "https://islamicfinance.org",
      publishedDate: new Date("2023-01-01")
    },
    metadata: {
      language: "english",
      pages: 150,
      difficulty: "intermediate"
    },
    topics: ["islamic-finance", "banking", "investment", "economics", "sharia-compliance"],
    tags: ["finance", "banking", "halal", "investment", "economics"],
    preview: {
      excerpt: "Learn the fundamental principles of Islamic finance and how they differ from conventional banking systems."
    },
    access: {
      level: "public",
      requiresLogin: false,
      downloadable: true,
      printable: true
    },
    statistics: {
      views: 634,
      downloads: 423,
      likes: 76,
      shares: 32
    },
    ratings: {
      average: 4.4,
      count: 45
    },
    featured: false,
    status: "published"
  },
  {
    title: "Quranic Recitation - Surah Al-Mulk",
    description: "Beautiful recitation of Surah Al-Mulk by Qari Abdul Rahman Al-Sudais. High-quality audio with clear pronunciation perfect for learning and memorization.",
    category: "audio",
    subcategory: "Quranic Recitation",
    type: "file",
    content: {
      externalUrl: "https://example.com/surah-mulk.mp3",
      fileName: "surah-al-mulk-sudais.mp3"
    },
    author: {
      name: "Qari Abdul Rahman Al-Sudais",
      title: "Imam of Masjid al-Haram",
      credentials: ["Imam of the Grand Mosque", "Renowned Qari"],
      bio: "One of the most beloved Quran reciters in the world, serving as Imam of the Grand Mosque in Mecca."
    },
    metadata: {
      language: "arabic",
      duration: 15, // 15 minutes
      difficulty: "all"
    },
    topics: ["quran", "recitation", "surah-mulk", "memorization", "audio"],
    tags: ["quran", "audio", "recitation", "sudais", "surah-mulk"],
    preview: {
      excerpt: "Listen to the beautiful recitation of Surah Al-Mulk, known for its protection and blessings when recited regularly."
    },
    access: {
      level: "public",
      requiresLogin: false,
      downloadable: true,
      printable: false
    },
    statistics: {
      views: 1890,
      downloads: 1234,
      likes: 267,
      shares: 156
    },
    ratings: {
      average: 4.9,
      count: 234
    },
    featured: true,
    status: "published"
  },
  {
    title: "Islamic History Timeline",
    description: "Interactive timeline covering major events in Islamic history from the time of Prophet Muhammad (PBUH) to the modern era. Includes key dates, personalities, and historical significance.",
    category: "apps",
    subcategory: "Educational Tools",
    type: "link",
    content: {
      externalUrl: "https://example.com/islamic-timeline"
    },
    author: {
      name: "Islamic Education Foundation",
      credentials: ["Educational Content Developers"],
      bio: "Dedicated to creating high-quality educational resources for Islamic learning."
    },
    metadata: {
      language: "english",
      difficulty: "all"
    },
    topics: ["islamic-history", "timeline", "education", "interactive", "learning"],
    tags: ["history", "timeline", "interactive", "education", "islam"],
    preview: {
      excerpt: "Explore the rich history of Islam through this interactive timeline featuring major events, personalities, and civilizations."
    },
    access: {
      level: "public",
      requiresLogin: false,
      downloadable: false,
      printable: false
    },
    statistics: {
      views: 567,
      downloads: 0,
      likes: 89,
      shares: 34
    },
    ratings: {
      average: 4.3,
      count: 56
    },
    featured: false,
    status: "published"
  }
];

async function seedResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Add slugs to resources data
    const resourcesWithSlugs = resourcesData.map(resource => ({
      ...resource,
      slug: slug(resource.title, { lower: true, strict: true })
    }));

    // Insert new resources
    const insertedResources = await Resource.insertMany(resourcesWithSlugs);
    console.log(`Inserted ${insertedResources.length} resources successfully`);

    // Display inserted resources
    insertedResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title} (${resource.category}) - ${resource.author.name}`);
    });

    console.log('\nResources seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding resources:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seeding function
seedResources();
