import React from "react";
import { FaQuran, FaBook, FaUserGraduate, FaCalendar, FaClock, FaUsers } from "react-icons/fa";

const Quran = () => {
  const programs = [
    {
      title: "Quran Memorization",
      description: "Structured program for memorizing the Holy Quran with proper tajweed",
      icon: <FaQuran className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Daily (Mon-Thu)",
      time: "After Fajr & After Asr",
      instructor: "Sheikh Hafiz Muhammad",
      level: "All Levels",
    },
    {
      title: "Tajweed Classes",
      description: "Learn the proper rules of Quranic recitation",
      icon: <FaBook className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Weekends",
      time: "10:00 AM - 12:00 PM",
      instructor: "Ustadh Ahmad Hassan",
      level: "Beginner to Advanced",
    },
    {
      title: "Tafsir Studies",
      description: "Understanding the meaning and context of Quranic verses",
      icon: <FaUserGraduate className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Every Friday",
      time: "After Maghrib",
      instructor: "Dr. Ibrahim Yusuf",
      level: "Intermediate",
    },
  ];

  const features = [
    {
      title: "Small Group Classes",
      description: "Personalized attention in groups of 5-10 students",
      icon: <FaUsers />,
    },
    {
      title: "Flexible Timing",
      description: "Multiple time slots to suit your schedule",
      icon: <FaClock />,
    },
    {
      title: "Qualified Teachers",
      description: "Learn from certified Quran teachers",
      icon: <FaUserGraduate />,
    },
    {
      title: "Regular Assessment",
      description: "Track your progress with periodic evaluations",
      icon: <FaBook />,
    },
  ];

  const testimonials = [
    {
      text: "The Quran memorization program has transformed my relationship with the Quran.",
      name: "Sr. Aisha Muhammad",
      role: "Corps Member",
    },
    {
      text: "The tajweed classes helped me improve my recitation significantly.",
      name: "Br. Yusuf Ibrahim",
      role: "Corps Member",
    },
    {
      text: "I've learned so much about the deeper meanings of the Quran through the tafsir classes.",
      name: "Sr. Fatima Ahmad",
      role: "Corps Member",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">Quran Classes</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with the Book of Allah through our comprehensive Quranic education programs
          </p>
        </div>

        {/* Programs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">Our Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center">
                  {program.icon}
                  <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <FaCalendar className="mr-2" />
                    <span>{program.schedule}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>{program.time}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUserGraduate className="mr-2" />
                    <span>{program.instructor}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <span className="text-sm font-medium text-mcan-secondary">
                    Level: {program.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">Program Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto bg-mcan-primary/10 rounded-full flex items-center justify-center text-mcan-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            Student Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-mcan-primary">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Join Our Classes Today</h2>
          <p className="text-gray-600 mb-8">
            Take the first step towards a stronger connection with the Quran
          </p>
          <div className="space-x-4">
            <a
              href="/register"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Register Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center border-2 border-mcan-primary text-mcan-primary px-6 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quran;
