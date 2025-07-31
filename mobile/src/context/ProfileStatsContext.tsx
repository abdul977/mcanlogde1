/**
 * Profile Stats Context
 * Manages user profile statistics (bookings, orders, messages)
 * and provides methods to refresh stats when data changes
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { API_CONFIG, ENDPOINTS } from '../constants';
import { useAuth } from './AuthContext';

interface ProfileStats {
  bookings: number;
  orders: number;
  messages: number;
}

interface ProfileStatsContextType {
  stats: ProfileStats;
  isLoading: boolean;
  refreshStats: () => Promise<void>;
  incrementOrderCount: () => void;
  incrementBookingCount: () => void;
}

const ProfileStatsContext = createContext<ProfileStatsContextType | undefined>(undefined);

interface ProfileStatsProviderProps {
  children: ReactNode;
}

export const ProfileStatsProvider: React.FC<ProfileStatsProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    bookings: 0,
    orders: 0,
    messages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user statistics from API
  const refreshStats = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setIsLoading(true);

      // Fetch bookings count
      const bookingsResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MY_BOOKINGS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      let bookingsCount = 0;
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        bookingsCount = bookingsData.bookings ? bookingsData.bookings.length : (Array.isArray(bookingsData) ? bookingsData.length : 0);
      }

      // Fetch orders count
      const ordersResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MY_ORDERS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      let ordersCount = 0;
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success && ordersData.orders) {
          ordersCount = ordersData.orders.length;
        }
      }

      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        bookings: bookingsCount,
        orders: ordersCount,
      }));

    } catch (error) {
      console.error('Error fetching profile stats:', error);
      // Don't throw error, just keep existing stats
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Increment order count (for immediate UI feedback)
  const incrementOrderCount = useCallback(() => {
    setStats(prevStats => ({
      ...prevStats,
      orders: prevStats.orders + 1,
    }));
  }, []);

  // Increment booking count (for immediate UI feedback)
  const incrementBookingCount = useCallback(() => {
    setStats(prevStats => ({
      ...prevStats,
      bookings: prevStats.bookings + 1,
    }));
  }, []);

  const value: ProfileStatsContextType = {
    stats,
    isLoading,
    refreshStats,
    incrementOrderCount,
    incrementBookingCount,
  };

  return (
    <ProfileStatsContext.Provider value={value}>
      {children}
    </ProfileStatsContext.Provider>
  );
};

// Hook to use profile stats
export const useProfileStats = (): ProfileStatsContextType => {
  const context = useContext(ProfileStatsContext);
  if (!context) {
    throw new Error('useProfileStats must be used within a ProfileStatsProvider');
  }
  return context;
};

export default ProfileStatsContext;
