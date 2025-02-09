import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const FilterSidebar = ({ applyFilters }) => {
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
  };

  return (
    <div className="p-4 space-y-6 w-[14rem] mt-[5rem]">
      {/* Location Filter */}
      <div className="p-4 border rounded-md">
        <h3 className="font-semibold mb-2">Location</h3>
        <select 
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="p-4 border rounded-md">
        <h3 className="font-semibold mb-2">Status</h3>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="p-4 border rounded-md">
        <h3 className="font-semibold mb-2">Date Range</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm text-gray-600">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={handleApplyFilters}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
