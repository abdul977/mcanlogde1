import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaMosque, FaHome, FaBuilding, FaBed } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AccommodationTypes = () => {
  const [category, setCategory] = useState([]);
  const navigation = useNavigate();

  const getAllCategory = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/category/get-category`
      );
      setCategory(response.data.category);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Define accommodation types with icons and descriptions
  const accommodationTypes = [
    {
      icon: FaHome,
      name: "Single Rooms",
      description: "Private rooms with basic amenities, perfect for individual corps members",
      gradient: "from-green-600 to-green-400"
    },
    {
      icon: FaBuilding,
      name: "Shared Apartments",
      description: "Shared living spaces with separate rooms for Muslim brothers/sisters",
      gradient: "from-emerald-600 to-emerald-400"
    },
    {
      icon: FaMosque,
      name: "Near Mosque",
      description: "Accommodations within walking distance to mosques",
      gradient: "from-mcan-primary to-mcan-secondary"
    },
    {
      icon: FaBed,
      name: "Family Units",
      description: "Larger units suitable for married corps members",
      gradient: "from-green-700 to-green-500"
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-mcan-primary mb-4">
            Find Your Ideal Accommodation
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            MCAN provides comfortable and shariah-compliant housing options for Muslim corps members,
            ensuring a peaceful environment that supports both your service and spiritual needs.
          </p>
        </div>

        {/* Accommodation Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {accommodationTypes.map((type, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-r ${type.gradient} p-6 text-white`}>
                <type.icon className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{type.name}</h3>
                <p className="text-sm opacity-90">{type.description}</p>
              </div>
              <div className="p-4">
                {category?.filter(cat => cat.name.toLowerCase().includes(type.name.toLowerCase())).map((filteredCat, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigation(`/category/${filteredCat.slug}`)}
                    className="text-mcan-primary hover:text-mcan-secondary cursor-pointer py-2 transition-colors duration-200"
                  >
                    Browse {filteredCat.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Islamic Quote */}
        <div className="text-center mt-16">
          <p className="text-gray-600 italic">
            "The believers in their mutual kindness, compassion and sympathy are just like one body"
            <span className="block text-sm mt-2">- Prophet Muhammad (peace be upon him)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccommodationTypes;
