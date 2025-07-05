import React, { useState } from "react";
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaFilter } from "react-icons/fa";

const FilterSidebar = ({ applyFilters, onFilterApply }) => {
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const locations = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Kano"];
  const statusOptions = ["published", "draft", "archived"];

  const handleApplyFilters = () => {
    const filters = {
      location: selectedLocation,
      status: selectedStatus,
      dateRange: dateRange.start && dateRange.end ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      } : null
    };
    applyFilters(filters);
    // Close mobile filters if callback provided
    if (onFilterApply) {
      onFilterApply();
    }
  };

  const handleClearFilters = () => {
    setSelectedLocation("");
    setSelectedStatus("");
    setDateRange({ start: "", end: "" });
    applyFilters({});
    if (onFilterApply) {
      onFilterApply();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
        <FaFilter className="text-mcan-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Filter Accommodations</h3>
      </div>

      {/* Location Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className="text-mcan-primary text-sm" />
          <label className="text-sm font-medium text-gray-700">Location</label>
        </div>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Availability Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-mcan-primary text-sm" />
          <label className="text-sm font-medium text-gray-700">Date Range</label>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleApplyFilters}
          className="w-full py-3 px-4 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white rounded-md hover:opacity-90 transition duration-300 font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-300 font-medium"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
