import React from "react";
import { FaHandHoldingHeart, FaGraduationCap, FaMosque, FaHome, FaBookOpen } from "react-icons/fa";

const Support = () => {
  const causes = [
    {
      title: "Education Support",
      description: "Fund Islamic education programs and scholarships for corps members",
      icon: <FaGraduationCap className="text-4xl text-mcan-primary mb-4" />,
      target: "₦2,000,000",
      raised: "₦850,000",
    },
    {
      title: "Mosque Development",
      description: "Support the maintenance and development of prayer facilities",
      icon: <FaMosque className="text-4xl text-mcan-primary mb-4" />,
      target: "₦5,000,000",
      raised: "₦2,100,000",
    },
    {
      title: "Corps Members Welfare",
      description: "Provide support for Muslim corps members in need",
      icon: <FaHandHoldingHeart className="text-4xl text-mcan-primary mb-4" />,
      target: "₦1,500,000",
      raised: "₦600,000",
    },
    {
      title: "Islamic Library",
      description: "Help establish and maintain our Islamic library resources",
      icon: <FaBookOpen className="text-4xl text-mcan-primary mb-4" />,
      target: "₦1,000,000",
      raised: "₦400,000",
    },
  ];

  const donationOptions = [
    {
      amount: "₦5,000",
      description: "Provides Islamic books for 2 corps members",
    },
    {
      amount: "₦10,000",
      description: "Sponsors a corps member's monthly accommodation",
    },
    {
      amount: "₦25,000",
      description: "Funds a week of educational programs",
    },
    {
      amount: "₦50,000",
      description: "Supports mosque maintenance for a month",
    },
    {
      amount: "₦100,000",
      description: "Establishes a mini library section",
    },
    {
      amount: "Custom",
      description: "Choose your own amount to donate",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">Support Our Cause</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your support helps us continue our mission of serving Muslim corps members and spreading Islamic knowledge
          </p>
        </div>

        {/* Current Causes */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">Current Causes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {causes.map((cause, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center">
                  {cause.icon}
                  <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                    {cause.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{cause.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Raised: {cause.raised}</span>
                      <span>Target: {cause.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-mcan-primary h-2 rounded-full"
                        style={{
                          width: `${(parseInt(cause.raised.replace(/[^0-9]/g, "")) /
                            parseInt(cause.target.replace(/[^0-9]/g, ""))) *
                            100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Options */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            Make a Donation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donationOptions.map((option, index) => (
              <button
                key={index}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-mcan-primary hover:shadow-md transition duration-300"
              >
                <h3 className="text-2xl font-bold text-mcan-primary mb-2">
                  {option.amount}
                </h3>
                <p className="text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6 text-center">
            Bank Transfer Details
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 rounded">
                <span className="font-semibold">Bank Name:</span>
                <span>MCAN FCT Bank</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded">
                <span className="font-semibold">Account Name:</span>
                <span>MCAN FCT Chapter</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded">
                <span className="font-semibold">Account Number:</span>
                <span>1234567890</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Need Assistance?</h2>
          <p className="text-gray-600 mb-8">
            Contact our support team for any questions about donations
          </p>
          <div className="space-x-4">
            <a
              href="/contact"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Contact Us
            </a>
            <a
              href="/lodge-sponsorship"
              className="inline-flex items-center border-2 border-mcan-primary text-mcan-primary px-6 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Lodge Sponsorship Program
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
