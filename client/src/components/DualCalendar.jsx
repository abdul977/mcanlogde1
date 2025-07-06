import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMoon, FaSun } from 'react-icons/fa';
import moment from 'moment-hijri';

const DualCalendar = ({ className = "" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');

  useEffect(() => {
    const updateDates = () => {
      const now = new Date();
      setCurrentDate(now);

      // Format Gregorian date
      const gregorian = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setGregorianDate(gregorian);

      // Format Hijri date using moment-hijri
      const hijri = moment(now).format('dddd, iD iMMMM iYYYY');
      setHijriDate(hijri);
    };

    updateDates();
    // Update every minute to keep dates current
    const interval = setInterval(updateDates, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <FaCalendarAlt className="text-mcan-primary text-xl mr-2" />
        <h3 className="text-lg font-semibold text-mcan-primary">Today's Date</h3>
      </div>

      <div className="space-y-4">
        {/* Gregorian Calendar */}
        <div className="bg-gradient-to-r from-mcan-primary/10 to-mcan-secondary/10 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FaSun className="text-mcan-secondary text-sm mr-2" />
            <span className="text-sm font-medium text-gray-700">Gregorian Calendar</span>
          </div>
          <p className="text-mcan-primary font-semibold text-base">
            {gregorianDate}
          </p>
        </div>

        {/* Islamic Calendar */}
        <div className="bg-gradient-to-r from-mcan-secondary/10 to-mcan-primary/10 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FaMoon className="text-mcan-primary text-sm mr-2" />
            <span className="text-sm font-medium text-gray-700">Islamic Calendar (Hijri)</span>
          </div>
          <p className="text-mcan-secondary font-semibold text-base">
            {hijriDate}
          </p>
        </div>
      </div>

      {/* Current Time */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm">
          Current Time: {currentDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })}
        </p>
      </div>
    </div>
  );
};

export default DualCalendar;
