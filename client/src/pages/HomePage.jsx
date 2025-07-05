import React from "react";
import Banner from "../components/Banner";
import AccommodationTypes from "../components/DreamVacation";
import IslamicLiving from "../components/NextTrip";
import Accommodations from "../components/Hotels";
import BlogSection from "../components/BlogSection";

const HomePage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Banner */}
      <Banner />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Accommodation Types Section */}
        <AccommodationTypes />

        {/* Islamic Living Section */}
        <IslamicLiving />

        {/* Available Accommodations Section */}
        <Accommodations />
      </div>

      {/* Blog Section */}
      <BlogSection />

      {/* Islamic Quote Section */}
      <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <blockquote className="text-2xl font-medium italic mb-4">
            "The world is a prison for the believer and a paradise for the disbeliever"
          </blockquote>
          <cite className="text-sm">- Prophet Muhammad ﷺ</cite>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-mcan-primary mb-4">
            Join MCAN FCT Chapter
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of a thriving Muslim community during your NYSC year. Connect with fellow corps members, 
            participate in Islamic programs, and find comfortable accommodation that suits your needs.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/register"
              className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white px-8 py-3 rounded-lg hover:opacity-90 transition duration-300"
            >
              Register Now
            </a>
            <a
              href="/about"
              className="border border-mcan-primary text-mcan-primary px-8 py-3 rounded-lg hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
