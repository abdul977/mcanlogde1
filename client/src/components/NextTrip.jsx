import React from "react";
import { FaMosque, FaBookOpen, FaHandsHelping } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";

const IslamicLiving = () => {
  const guidanceCards = [
    {
      icon: FaMosque,
      title: "Prayer-Friendly Locations",
      description:
        "Find accommodations near mosques and prayer facilities, making it convenient to fulfill your daily prayers...",
      gradient: "from-mcan-primary to-mcan-secondary",
    },
    {
      icon: FaHandsHelping,
      title: "Muslim Community Support",
      description:
        "Connect with local Muslim communities and fellow corps members for spiritual and social support...",
      gradient: "from-green-600 to-green-400",
    },
    {
      icon: FaBookOpen,
      title: "Islamic Study Facilities",
      description:
        "Access to spaces suitable for Islamic studies and regular halaqah sessions with fellow corps members...",
      gradient: "from-emerald-600 to-emerald-400",
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-mcan-primary mb-4">
            Islamic Living During Your Service Year
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            MCAN ensures your accommodation supports both your NYSC duties and Islamic practices
          </p>
        </div>

        {/* Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {guidanceCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-r ${card.gradient} p-8 text-white h-full`}>
                <div className="flex justify-center mb-6">
                  <card.icon className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-semibold mb-4 text-center">
                  {card.title}
                </h2>
                <p className="text-gray-100 text-center">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-mcan-primary mb-6 text-center">
              Our Commitment to Your Well-being
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FaMosque,
                  text: "Prayer Spaces",
                },
                {
                  icon: GiPathDistance,
                  text: "Strategic Locations",
                },
                {
                  icon: FaHandsHelping,
                  text: "Community Support",
                },
                {
                  icon: FaBookOpen,
                  text: "Islamic Resources",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 text-center"
                >
                  <feature.icon className="w-10 h-10 text-mcan-primary mb-3" />
                  <p className="text-gray-700 font-medium">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Islamic Quote */}
        <div className="text-center mt-16 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white p-8 rounded-lg shadow-lg">
          <p className="text-xl italic">
            "Whoever takes a path seeking knowledge, Allah will make easy for them a path to Paradise"
          </p>
          <p className="mt-2 text-sm">- Hadith, Sahih Muslim</p>
        </div>
      </div>
    </div>
  );
};

export default IslamicLiving;
