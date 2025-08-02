// Prayer times utility for Abuja, Nigeria
// Coordinates: Latitude 9.0579, Longitude 7.4951

export const PRAYER_TIMES = {
  fajr: { hour: 5, minute: 30 },
  dhuhr: { hour: 13, minute: 0 },
  asr: { hour: 16, minute: 15 },
  maghrib: { hour: 18, minute: 45 },
  isha: { hour: 20, minute: 0 }
};

export const PRAYER_NAMES = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr', 
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
};

/**
 * Get the current prayer based on the current time
 * @returns {Object} Current prayer information
 */
export const getCurrentPrayer = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Convert prayer times to minutes for comparison
  const prayerTimesInMinutes = {
    fajr: PRAYER_TIMES.fajr.hour * 60 + PRAYER_TIMES.fajr.minute,
    dhuhr: PRAYER_TIMES.dhuhr.hour * 60 + PRAYER_TIMES.dhuhr.minute,
    asr: PRAYER_TIMES.asr.hour * 60 + PRAYER_TIMES.asr.minute,
    maghrib: PRAYER_TIMES.maghrib.hour * 60 + PRAYER_TIMES.maghrib.minute,
    isha: PRAYER_TIMES.isha.hour * 60 + PRAYER_TIMES.isha.minute
  };

  let currentPrayer = 'isha'; // Default to Isha (night prayer)
  let nextPrayer = 'fajr';
  let timeToNext = 0;

  if (currentTimeInMinutes >= prayerTimesInMinutes.fajr && currentTimeInMinutes < prayerTimesInMinutes.dhuhr) {
    currentPrayer = 'fajr';
    nextPrayer = 'dhuhr';
    timeToNext = prayerTimesInMinutes.dhuhr - currentTimeInMinutes;
  } else if (currentTimeInMinutes >= prayerTimesInMinutes.dhuhr && currentTimeInMinutes < prayerTimesInMinutes.asr) {
    currentPrayer = 'dhuhr';
    nextPrayer = 'asr';
    timeToNext = prayerTimesInMinutes.asr - currentTimeInMinutes;
  } else if (currentTimeInMinutes >= prayerTimesInMinutes.asr && currentTimeInMinutes < prayerTimesInMinutes.maghrib) {
    currentPrayer = 'asr';
    nextPrayer = 'maghrib';
    timeToNext = prayerTimesInMinutes.maghrib - currentTimeInMinutes;
  } else if (currentTimeInMinutes >= prayerTimesInMinutes.maghrib && currentTimeInMinutes < prayerTimesInMinutes.isha) {
    currentPrayer = 'maghrib';
    nextPrayer = 'isha';
    timeToNext = prayerTimesInMinutes.isha - currentTimeInMinutes;
  } else if (currentTimeInMinutes >= prayerTimesInMinutes.isha) {
    currentPrayer = 'isha';
    nextPrayer = 'fajr';
    // Time to next Fajr (next day)
    timeToNext = (24 * 60) - currentTimeInMinutes + prayerTimesInMinutes.fajr;
  } else {
    // Before Fajr (early morning)
    currentPrayer = 'isha'; // Still Isha time from previous day
    nextPrayer = 'fajr';
    timeToNext = prayerTimesInMinutes.fajr - currentTimeInMinutes;
  }

  return {
    current: {
      name: PRAYER_NAMES[currentPrayer],
      key: currentPrayer,
      time: formatPrayerTime(PRAYER_TIMES[currentPrayer])
    },
    next: {
      name: PRAYER_NAMES[nextPrayer],
      key: nextPrayer,
      time: formatPrayerTime(PRAYER_TIMES[nextPrayer]),
      timeToNext: formatTimeToNext(timeToNext)
    },
    allTimes: Object.keys(PRAYER_TIMES).map(key => ({
      name: PRAYER_NAMES[key],
      key,
      time: formatPrayerTime(PRAYER_TIMES[key]),
      isCurrent: key === currentPrayer
    }))
  };
};

/**
 * Format prayer time for display
 * @param {Object} time - Time object with hour and minute
 * @returns {string} Formatted time string
 */
export const formatPrayerTime = (time) => {
  const hour = time.hour > 12 ? time.hour - 12 : time.hour === 0 ? 12 : time.hour;
  const period = time.hour >= 12 ? 'PM' : 'AM';
  const minute = time.minute.toString().padStart(2, '0');
  return `${hour}:${minute} ${period}`;
};

/**
 * Format time remaining to next prayer
 * @param {number} minutes - Minutes remaining
 * @returns {string} Formatted time string
 */
export const formatTimeToNext = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

/**
 * Get prayer times formatted for display
 * @returns {Object} Formatted prayer times
 */
export const getFormattedPrayerTimes = () => {
  return Object.keys(PRAYER_TIMES).reduce((acc, key) => {
    acc[key] = formatPrayerTime(PRAYER_TIMES[key]);
    return acc;
  }, {});
};
