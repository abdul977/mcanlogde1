import React, { useState, useEffect } from "react";
import axios from "axios";
import FilterSidebar from "../components/Serach/FilterSidebar";
import ProductList from "../components/Serach/ProductList";
import { useSearch } from "../context/Serach";
import { FaFilter, FaTimes } from "react-icons/fa";

const SearchPage = () => {
  const [search, setSearch] = useSearch();
  const [filteredResults, setFilteredResults] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const applyFilters = async (filters) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/post/product-filters`,
        filters
      );
      if (response.data.success) {
        setFilteredResults(response.data.products);
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const closeMobileFilters = () => {
    setShowMobileFilters(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={toggleMobileFilters}
            className="flex items-center space-x-2 bg-mcan-primary text-white px-4 py-2 rounded-lg hover:bg-mcan-secondary transition duration-300"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <FilterSidebar applyFilters={applyFilters} />
          </div>

          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileFilters}></div>
              <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={closeMobileFilters}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <FilterSidebar applyFilters={applyFilters} onFilterApply={closeMobileFilters} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <ProductList
              products={
                filteredResults.length > 0 ? filteredResults : search.results
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
