#!/usr/bin/env node
import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import slug from "slugify";
import Blog from "../models/Blog.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const blogsData = [
  {
    title: "The Importance of Community During NYSC",
    content: `As a Muslim corps member, finding your place in a new environment can be challenging. The National Youth Service Corps (NYSC) year is a time of growth, learning, and service to our nation. For Muslim corps members, it's also an opportunity to strengthen our faith and build lasting bonds with fellow believers.

The Muslim Corpers' Association of Nigeria (MCAN) serves as a beacon of hope and support for thousands of Muslim youth serving across the country. Through our various programs and initiatives, we create an environment where young Muslims can thrive both spiritually and professionally.

Community support is essential during this transformative year. From finding halal accommodation to participating in Islamic programs, MCAN provides the framework for a fulfilling NYSC experience. Our members often describe their NYSC year as one of the most spiritually enriching periods of their lives.

Join us in building a stronger Muslim community. Together, we can make a positive impact on our society while staying true to our Islamic values.`,
    excerpt: "Discover how MCAN creates a supportive community for Muslim corps members during their NYSC year, fostering both spiritual growth and professional development.",
    author: "MCAN Admin",
    featuredImage: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop",
    status: "published",
    tags: ["community", "nysc", "support", "muslim", "youth"],
    category: "community",
    featured: true,
    metaDescription: "Learn about the importance of community support for Muslim corps members during NYSC and how MCAN provides guidance and fellowship.",
  },
  {
    title: "Finding Halal Accommodation: A Guide for Muslim Corps Members",
    content: `One of the biggest challenges facing Muslim corps members is finding suitable accommodation that aligns with Islamic principles. This comprehensive guide will help you navigate the accommodation search process and find a place that supports your spiritual journey.

When searching for accommodation, consider these key factors:

1. **Proximity to Islamic Centers**: Look for lodges near mosques or Islamic centers where you can easily attend prayers and Islamic programs.

2. **Gender-Appropriate Housing**: Ensure the accommodation respects Islamic guidelines regarding gender separation and privacy.

3. **Halal Food Access**: Choose locations with easy access to halal food sources or cooking facilities.

4. **Community Environment**: Seek accommodations where you can connect with fellow Muslim corps members.

MCAN's accommodation support program helps corps members find suitable housing options across all states. Our network of verified landlords and Islamic-friendly accommodations ensures you have a comfortable and spiritually conducive living environment.

Remember, your accommodation choice can significantly impact your NYSC experience. Take time to research and choose wisely.`,
    excerpt: "A comprehensive guide to help Muslim corps members find halal and Islamic-friendly accommodation during their NYSC year.",
    author: "Accommodation Committee",
    featuredImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    status: "published",
    tags: ["accommodation", "halal", "housing", "guide", "nysc"],
    category: "education",
    featured: true,
    metaDescription: "Essential tips for Muslim corps members to find halal and Islamic-friendly accommodation during NYSC service year.",
  },
  {
    title: "Ramadan Preparation: Spiritual and Practical Tips",
    content: `As the blessed month of Ramadan approaches, it's essential for Muslim corps members to prepare both spiritually and practically. This preparation becomes even more important when you're away from home and family during your NYSC year.

**Spiritual Preparation:**
- Increase your dhikr (remembrance of Allah) and Quran recitation
- Seek forgiveness and make sincere tawbah
- Set spiritual goals for the month
- Plan your Quran completion schedule

**Practical Preparation:**
- Locate nearby mosques for Tarawih prayers
- Plan your suhur and iftar meals
- Connect with local Muslim communities
- Arrange your work schedule to accommodate fasting

MCAN organizes special Ramadan programs including:
- Community iftar gatherings
- Tarawih prayers at MCAN centers
- Quran study circles
- Charity drives and zakat distribution

The month of Ramadan is a time of spiritual renewal and community bonding. Let's make this Ramadan a transformative experience that strengthens our faith and our bonds as Muslim corps members.`,
    excerpt: "Essential spiritual and practical tips to help Muslim corps members prepare for and make the most of Ramadan during their NYSC year.",
    author: "Islamic Affairs Committee",
    featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    status: "published",
    tags: ["ramadan", "fasting", "spirituality", "preparation", "islamic"],
    category: "islamic",
    featured: false,
    metaDescription: "Comprehensive guide for Muslim corps members to prepare spiritually and practically for Ramadan during NYSC.",
  },
  {
    title: "Career Development Through Islamic Principles",
    content: `Islam provides comprehensive guidance for all aspects of life, including our professional development. As Muslim corps members, we have the unique opportunity to apply Islamic principles in our career journey while serving our nation.

**Key Islamic Principles for Career Success:**

1. **Ihsan (Excellence)**: Strive for excellence in all your work. The Prophet (SAW) said, "Allah loves, when one of you does a job, that he does it with excellence."

2. **Amanah (Trust)**: Be trustworthy and reliable in your professional responsibilities.

3. **Adl (Justice)**: Treat colleagues and beneficiaries fairly and justly.

4. **Sabr (Patience)**: Develop patience and perseverance in facing challenges.

**MCAN Career Development Programs:**
- Professional skills workshops
- Mentorship programs with successful Muslim professionals
- Networking events and career fairs
- Islamic entrepreneurship training

Your NYSC year is an excellent time to build professional skills while maintaining your Islamic identity. MCAN's career development initiatives help you achieve success in both this world and the hereafter.

Remember, true success is achieving excellence in your profession while pleasing Allah SWT.`,
    excerpt: "Learn how to apply Islamic principles in your career development and take advantage of MCAN's professional development programs.",
    author: "Career Development Team",
    featuredImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    status: "published",
    tags: ["career", "professional", "islamic", "development", "success"],
    category: "education",
    featured: false,
    metaDescription: "Discover how to integrate Islamic principles into your career development during NYSC with MCAN's guidance.",
  },
  {
    title: "MCAN FCT Chapter: Building Bridges in the Capital",
    content: `The Federal Capital Territory (FCT) chapter of MCAN stands as one of our most vibrant and active chapters, serving hundreds of Muslim corps members posted to Abuja and surrounding areas.

**Our FCT Chapter Achievements:**
- Successfully accommodated over 500 Muslim corps members
- Established partnerships with 15+ Islamic centers
- Organized 50+ educational and spiritual programs
- Created a network of halal food vendors and services

**Key Programs and Services:**
1. **Accommodation Support**: Verified halal lodges and Islamic-friendly accommodations
2. **Spiritual Programs**: Weekly Islamic lectures and Quran study circles
3. **Professional Development**: Career workshops and networking events
4. **Community Service**: Charity drives and community outreach programs

**Upcoming Initiatives:**
- Digital Islamic library project
- Youth entrepreneurship incubation program
- Inter-faith dialogue sessions
- Environmental conservation projects

The FCT chapter continues to set the standard for excellence in serving Muslim corps members. Our commitment to providing comprehensive support ensures that every corps member has a fulfilling and spiritually enriching experience in the nation's capital.

Join us in our mission to build a stronger Muslim community in FCT and beyond.`,
    excerpt: "Discover the achievements and programs of MCAN's FCT chapter and how it serves Muslim corps members in Nigeria's capital.",
    author: "MCAN FCT Chapter",
    featuredImage: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&h=600&fit=crop",
    status: "published",
    tags: ["fct", "abuja", "chapter", "programs", "achievements"],
    category: "announcements",
    featured: true,
    metaDescription: "Learn about MCAN FCT chapter's programs, achievements, and services for Muslim corps members in Abuja.",
  }
];

async function seedBlogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Add slugs to blogs data
    const blogsWithSlugs = blogsData.map(blog => ({
      ...blog,
      slug: slug(blog.title, { lower: true, strict: true })
    }));

    // Insert new blogs
    const insertedBlogs = await Blog.insertMany(blogsWithSlugs);
    console.log(`Inserted ${insertedBlogs.length} blogs successfully`);

    // Display inserted blogs
    insertedBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} (${blog.category}) - Featured: ${blog.featured}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
}

console.log('Starting blog seeding process...');
seedBlogs();
