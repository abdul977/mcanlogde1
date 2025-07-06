import React, { useState, useEffect } from 'react';
import { FaMosque, FaClock, FaArrowRight } from 'react-icons/fa';
import { getCurrentPrayer } from '../utils/prayerTimes';

const DynamicPrayerTimes = ({ className = "" }) => {
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
    return <div>Loading prayer times...</div>;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Current Prayer Header */}
      <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaMosque className="text-xl mr-2" />
            <div>
              <h3 className="font-semibold">Current Prayer Time</h3>
              <p className="text-sm opacity-90">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{prayerInfo.current.name}</p>
            <p className="text-sm opacity-90">{prayerInfo.current.time}</p>
          </div>
        </div>
      </div>

      {/* Next Prayer Info */}
      <div className="p-4 bg-gradient-to-r from-mcan-primary/10 to-mcan-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaClock className="text-mcan-primary mr-2" />
            <span className="text-sm text-gray-700">Next Prayer:</span>
          </div>
          <div className="flex items-center text-mcan-primary">
            <span className="font-semibold mr-2">{prayerInfo.next.name}</span>
            <FaArrowRight className="text-xs mr-2" />
            <span className="text-sm">{prayerInfo.next.timeToNext}</span>
          </div>
        </div>
      </div>

      {/* All Prayer Times */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Today's Prayer Schedule</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {prayerInfo.allTimes.map((prayer) => (
            <div
              key={prayer.key}
              className={`text-center p-3 rounded-lg border transition-all ${
                prayer.isCurrent
                  ? 'bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white shadow-lg'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <FaMosque className={`text-lg mx-auto mb-1 ${
                prayer.isCurrent ? 'text-white' : 'text-mcan-primary'
              }`} />
              <h5 className={`font-semibold text-sm mb-1 ${
                prayer.isCurrent ? 'text-white' : 'text-gray-800'
              }`}>
                {prayer.name}
              </h5>
              <p className={`text-xs ${
                prayer.isCurrent ? 'text-white opacity-90' : 'text-mcan-secondary'
              }`}>
                {prayer.time}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Islamic Quote */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-600 italic text-center">
          "And establish prayer at the two ends of the day and at the approach of the night" - Quran 11:114
        </p>
      </div>
    </div>
  );
};

export default DynamicPrayerTimes;
