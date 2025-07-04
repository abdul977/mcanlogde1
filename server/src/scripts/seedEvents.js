#!/usr/bin/env node
import { connectToDb } from "../config/db.js";
import Event from "../models/Event.js";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";

// Set MongoDB URI directly
const MONGODB_URI = "mongodb+srv://abdul977:salis977@cluster0.s6mmj.mongodb.net/mcanlogde?retryWrites=true&w=majority&appName=Cluster0";

const events = [
  {
    title: "Feed A Fasting Soul Campaign - Kogi State",
    slug: "feed-a-fasting-soul-campaign-kogi-state",
    description: `Our Goal: Feeding 100 Fasting Corps Members Daily
Budget: ₦3,000,000 (Three Million Naira)

Bank Details:
- Bank: Unity Bank
- Account Number: 0008284118
- Account Name: Muslim Corpers' Association of Nigeria

Contact:
- Amir: 09138978668
- General Secretary: 0810977088
- Da'wah Chairman: 09138978668`,
    date: new Date("2025-03-10"), // Approximate start of Ramadan 2025
    location: "MCAN Kogi State Chapter",
    status: "published",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg" // Default image, will need to be updated
  },
  {
    title: "Feed A Fasting Soul - Obudu Branch",
    slug: "feed-a-fasting-soul-obudu-branch",
    description: `Support Our Ramadan Activities for Ramadan 1446/2025

Bank Details:
- Bank: PalmPay Bank
- Account Name: Sultan Azeez
- Account Number: 8142799507

Contact:
- Sultan Azeez (MCAN Coordinator): 08142799507
- General Secretary (MCAN): 09025920410`,
    date: new Date("2025-03-10"), // Approximate start of Ramadan 2025
    location: "MCAN Obudu Branch",
    status: "published",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg" // Default image, will need to be updated
  },
  {
    title: "40th Annual Convention of MCAN",
    slug: "40th-annual-convention-of-mcan",
    description: `Theme: "Mentorship as a Catalyst for the Growth of Muslim Youth in Contemporary Society"

Schedule:
Day 1 (13th Feb): Arrival and Registration, Welcome Address, Introduction of Delegates
Day 2 (14th Feb): 
- "Our Tarbiyyah: What Went Wrong" by Ustaz Nurudeen Abdulmalik
- "Evils of Tribalism" by Ustaz Abdulganiy
- "MCAN: The Genesis, The Journey So Far" by Ameer Muhammad Abioye
Day 3 (15th Feb):
- "Mentorship as a Catalyst" by Dr. Tajudeen Bello
- "The Modern Muslim" by Arc Pen Abdul
Day 4 (16th Feb): Departure

Venue: NYSC Orientation Camp, Kubwa, FCT-Abuja`,
    date: new Date("2025-02-13T10:00:00"),
    location: "NYSC Orientation Camp, Kubwa, FCT-Abuja",
    status: "published",
    image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg" // Default image, will need to be updated
  }
];

const seedEvents = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Clear existing events
    await Event.deleteMany({});
    console.log("Cleared existing events");

    console.log("Inserting new events...");
    const createdEvents = await Event.insertMany(events);
    console.log("Successfully seeded events:", createdEvents);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding events:", error);
    process.exit(1);
  }
};

console.log("Starting seed process...");
seedEvents();