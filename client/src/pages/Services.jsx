import React from "react";
import { FaHandsHelping, FaGraduationCap, FaPray, FaHome, FaHeart, FaBookReader } from "react-icons/fa";

const Services = () => {
  const services = [
    {
      title: "Accommodation Support",
      description: "Assistance in finding suitable and halal accommodation for Muslim corps members",
      icon: <FaHome className="text-4xl text-mcan-primary mb-4" />,
      features: ["Lodge Recommendations", "Area Guidance", "Roommate Matching"],
    },
    {
      title: "Islamic Education",
      description: "Regular classes and workshops to enhance Islamic knowledge",
      icon: <FaBookReader className="text-4xl text-mcan-primary mb-4" />,
      features: ["Quran Classes", "Islamic Studies", "Arabic Language"],
    },
    {
      title: "Prayer Facilities",
      description: "Information about mosques and prayer spaces near service locations",
      icon: <FaPray className="text-4xl text-mcan-primary mb-4" />,
      features: ["Mosque Directory", "Prayer Timetable", "Jumu'ah Arrangements"],
    },
    {
      title: "Career Development",
      description: "Professional development support for corps members",
      icon: <FaGraduationCap className="text-4xl text-mcan-primary mb-4" />,
      features: ["CV Writing", "Interview Tips", "Networking Events"],
    },
    {
      title: "Welfare Support",
      description: "Assistance for corps members facing challenges during service year",
      icon: <FaHandsHelping className="text-4xl text-mcan-primary mb-4" />,
      features: ["Financial Aid", "Health Support", "Emergency Assistance"],
    },
    {
      title: "Marriage Services",
      description: "Support for corps members seeking halal marriage",
      icon: <FaHeart className="text-4xl text-mcan-primary mb-4" />,
      features: ["Marriage Counseling", "Partner Matching", "Nikah Services"],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 mb-12">
            Supporting Muslim Corps Members Throughout Their Service Year
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-center mb-6">
                {service.icon}
                <h3 className="text-xl font-semibold text-mcan-primary mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
              </div>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-mcan-secondary rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Service Request Section */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6">Need Assistance?</h2>
          <p className="text-gray-600 mb-6">
            If you require any of our services or have questions, please don't hesitate to reach out.
            We're here to support you during your service year.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/contact"
              className="bg-mcan-primary text-white text-center py-3 px-6 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Contact Us
            </a>
            <a
              href="/register"
              className="bg-mcan-accent text-white text-center py-3 px-6 rounded-md hover:bg-mcan-primary transition duration-300"
            >
              Join MCAN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
