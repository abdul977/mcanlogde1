import React, { useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaMosque } from "react-icons/fa";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useSearch } from "../context/Serach";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useSearch();

  const handelSerach = async (e) => {
    e.preventDefault();
    if (!search.keyword) {
      console.error("Search keyword is missing");
      return;
    }
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/api/post/search/${search.keyword}`;
      const { data } = await axios.get(url);
      setSearch({ ...search, results: data.results || data });
      navigate("/search");
    } catch (error) {
      console.error("Error during search API call:", error);
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-r from-mcan-primary to-mcan-secondary">
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+CiAgPHBhdGggZD0iTTI1LDAgTDUwLDI1IEwyNSw1MCBMMCwyNSBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')]"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white h-full px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-6">
          <FaMosque className="text-3xl sm:text-4xl mb-2 sm:mb-0 sm:mr-3 text-mcan-light" />
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-center">
            Welcome to MCAN
          </h1>
        </div>

        <p className="text-lg sm:text-xl lg:text-2xl mt-4 text-center max-w-4xl mx-auto px-4">
          Find comfortable and halal-friendly accommodation for Muslim corps members
        </p>

        <p className="text-sm sm:text-lg lg:text-xl mt-4 text-center text-mcan-light italic max-w-3xl mx-auto px-4">
          "And whoever emigrates for the cause of Allah will find on the earth many locations and abundance" - (4:100)
        </p>

        {/* Search Bar */}
        <div className="mt-12 w-full max-w-[57rem] sm:w-[80%] md:w-[60%] bg-white/95 p-6 rounded-lg shadow-2xl">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mcan-primary" />
              <input
                type="text"
                placeholder="Search for accommodation..."
                className="w-full pl-10 p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-mcan-primary bg-white"
                value={search.keyword}
                onChange={(e) => setSearch({ ...search, keyword: e.target.value })}
              />
            </div>
            <button
              onClick={handelSerach}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white font-medium rounded-md hover:from-mcan-secondary hover:to-mcan-primary transition-all duration-300 transform hover:scale-105"
            >
              Search
            </button>
          </div>
          
          <div className="mt-4 text-gray-600 text-sm text-center">
            Find suitable accommodation near mosques, halal restaurants, and other Islamic facilities
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
