#!/usr/bin/env node
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://abdulmuminibrahim74:salis977@cluster0.41c1t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function checkEvents() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    // Get the list of all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));

    // List collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in current database:');
    collections.forEach(col => console.log(`- ${col.name}`));

    // Find events
    const events = await mongoose.connection.db.collection('events').find({}).toArray();
    console.log('\nFound events:', events.length);
    events.forEach(event => {
      console.log(`\nEvent: ${event.title}`);
      console.log(`Database: ${mongoose.connection.db.databaseName}`);
      console.log(`Collection: events`);
      console.log('Data:', event);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkEvents();