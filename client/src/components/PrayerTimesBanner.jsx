import React, { useState, useEffect } from 'react';
import { FaMosque, FaClock } from 'react-icons/fa';
import { getCurrentPrayer } from '../utils/prayerTimes';

const PrayerTimesBanner = () => {
  const [prayerInfo, setPrayerInfo] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updatePrayerTimes = () => {
      const now = new Date();
      setCurrentTime(now);
      setPrayerInfo(getCurrentPrayer());
    };

    // Update immediately
    updatePrayerTimes();

    // Update every minute
    const interval = setInterval(updatePrayerTimes, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!prayerInfo) {
    return (
      <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white text-xs sm:text-sm py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <span>Loading prayer times...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white text-xs sm:text-sm py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          {/* Mobile Layout - Current Prayer */}
          <div className="sm:hidden flex items-center space-x-2">
            <FaMosque className="text-sm" />
            <span className="font-semibold">
              {prayerInfo.current.name} {prayerInfo.current.time}
            </span>
            <span className="opacity-75">•</span>
            <FaClock className="text-xs" />
            <span className="text-xs">
              Next: {prayerInfo.next.name} in {prayerInfo.next.timeToNext}
            </span>
          </div>

          {/* Desktop Layout - All Prayer Times */}
          <div className="hidden sm:flex items-center space-x-4 md:space-x-6">
            {prayerInfo.allTimes.map((prayer) => (
              <span
                key={prayer.key}
                className={`transition-all ${
                  prayer.isCurrent
                    ? 'font-bold bg-white/20 px-2 py-1 rounded'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                {prayer.name} {prayer.time}
                {prayer.isCurrent && (
                  <span className="ml-1 text-xs">
                    (Current)
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Time Display */}
          <div className="hidden lg:flex items-center ml-6 space-x-2 opacity-75">
            <FaClock className="text-xs" />
            <span className="text-xs">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesBanner;
