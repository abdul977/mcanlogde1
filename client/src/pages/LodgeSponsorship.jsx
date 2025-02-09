import React from "react";
import { FaHome, FaUsers, FaHandshake, FaStar, FaChartLine } from "react-icons/fa";

const LodgeSponsorship = () => {
  const sponsorshipLevels = [
    {
      level: "Bronze Sponsor",
      amount: "₦100,000",
      duration: "3 months",
      benefits: [
        "Sponsor 2 corps members' accommodation",
        "Recognition on MCAN website",
        "Quarterly impact report",
      ],
      icon: <FaHome className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      level: "Silver Sponsor",
      amount: "₦250,000",
      duration: "6 months",
      benefits: [
        "Sponsor 5 corps members' accommodation",
        "Recognition on MCAN website",
        "Monthly impact report",
        "Invitation to MCAN events",
      ],
      icon: <FaHandshake className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      level: "Gold Sponsor",
      amount: "₦500,000",
      duration: "1 year",
      benefits: [
        "Sponsor 10 corps members' accommodation",
        "Premium recognition on MCAN website",
        "Monthly impact report",
        "VIP access to MCAN events",
        "Dedicated support coordinator",
      ],
      icon: <FaStar className="text-4xl text-mcan-primary mb-4" />,
    },
  ];

  const impactStats = [
    {
      number: "500+",
      label: "Corps Members Supported",
      icon: <FaUsers className="text-3xl text-mcan-primary" />,
    },
    {
      number: "50+",
      label: "Partner Lodges",
      icon: <FaHome className="text-3xl text-mcan-primary" />,
    },
    {
      number: "100%",
      label: "Transparency",
      icon: <FaChartLine className="text-3xl text-mcan-primary" />,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">MCAN Lodge Sponsorship Program</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Support Muslim corps members by sponsoring their accommodation needs through our verified lodge network
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {impactStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <h3 className="text-3xl font-bold text-mcan-primary mb-2">{stat.number}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sponsorship Levels */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            Sponsorship Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sponsorshipLevels.map((level, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center">
                  {level.icon}
                  <h3 className="text-2xl font-semibold text-mcan-primary mb-2">
                    {level.level}
                  </h3>
                  <div className="text-3xl font-bold text-mcan-secondary mb-2">
                    {level.amount}
                  </div>
                  <p className="text-gray-600 mb-6">Duration: {level.duration}</p>
                  <ul className="text-left space-y-3 mb-8">
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-mcan-primary rounded-full mt-2 mr-2"></span>
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-mcan-primary text-white py-3 px-6 rounded-md hover:bg-mcan-secondary transition duration-300">
                    Become a Sponsor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-mcan-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose a Package</h3>
              <p className="text-gray-600">
                Select a sponsorship level that matches your support goals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-mcan-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Make Your Contribution</h3>
              <p className="text-gray-600">
                Complete your sponsorship through our secure payment system
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-mcan-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Track Your Impact</h3>
              <p className="text-gray-600">
                Receive regular updates about the corps members you're supporting
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Need More Information?</h2>
          <p className="text-gray-600 mb-8">
            Contact our sponsorship team to discuss custom packages or learn more about the program
          </p>
          <div className="space-x-4">
            <a
              href="/contact"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Contact Us
            </a>
            <a
              href="/donate"
              className="inline-flex items-center border-2 border-mcan-primary text-mcan-primary px-6 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Other Ways to Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LodgeSponsorship;
