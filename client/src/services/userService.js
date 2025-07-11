import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const { token } = JSON.parse(auth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get user profile data
 * @returns {Promise} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/api/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} Updated user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/api/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user info (legacy endpoint)
 * @returns {Promise} User info
 */
export const getUserInfo = async () => {
  try {
    const response = await api.get('/auth/api/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

/**
 * Validate profile completion
 * @param {Object} user - User object
 * @returns {Object} Validation result
 */
export const validateProfileCompletion = (user) => {
  const requiredFields = ['name', 'email', 'gender', 'stateCode', 'batch', 'stream', 'callUpNumber'];
  const missingFields = requiredFields.filter(field => 
    !user[field] || user[field].toString().trim() === ''
  );
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
  };
};

/**
 * Format NYSC details for display
 * @param {Object} user - User object
 * @returns {Object} Formatted NYSC details
 */
export const formatNyscDetails = (user) => {
  return {
    gender: user.gender || 'Not specified',
    stateCode: user.stateCode || 'Not specified',
    batch: user.batch || 'Not specified',
    stream: user.stream || 'Not specified',
    callUpNumber: user.callUpNumber || 'Not specified',
    phone: user.phone || 'Not specified',
    institution: user.institution || 'Not specified',
    course: user.course || 'Not specified'
  };
};

/**
 * Get state codes for Nigeria
 * @returns {Array} Array of Nigerian state codes
 */
export const getNigerianStateCodes = () => {
  return [
    'AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BE', 'BO', 'CR', 'DE',
    'EB', 'ED', 'EK', 'EN', 'FC', 'GO', 'IM', 'JI', 'KD', 'KN',
    'KT', 'KE', 'KO', 'KW', 'LA', 'NA', 'NI', 'OG', 'ON', 'OS',
    'OY', 'PL', 'RI', 'SO', 'TA', 'YO', 'ZA'
  ];
};

/**
 * Get full state name from code
 * @param {string} code - State code
 * @returns {string} Full state name
 */
export const getStateNameFromCode = (code) => {
  const stateMap = {
    'AB': 'Abia', 'AD': 'Adamawa', 'AK': 'Akwa Ibom', 'AN': 'Anambra',
    'BA': 'Bauchi', 'BY': 'Bayelsa', 'BE': 'Benue', 'BO': 'Borno',
    'CR': 'Cross River', 'DE': 'Delta', 'EB': 'Ebonyi', 'ED': 'Edo',
    'EK': 'Ekiti', 'EN': 'Enugu', 'FC': 'FCT', 'GO': 'Gombe',
    'IM': 'Imo', 'JI': 'Jigawa', 'KD': 'Kaduna', 'KN': 'Kano',
    'KT': 'Katsina', 'KE': 'Kebbi', 'KO': 'Kogi', 'KW': 'Kwara',
    'LA': 'Lagos', 'NA': 'Nasarawa', 'NI': 'Niger', 'OG': 'Ogun',
    'ON': 'Ondo', 'OS': 'Osun', 'OY': 'Oyo', 'PL': 'Plateau',
    'RI': 'Rivers', 'SO': 'Sokoto', 'TA': 'Taraba', 'YO': 'Yobe',
    'ZA': 'Zamfara'
  };
  return stateMap[code] || code;
};

export default {
  getUserProfile,
  updateUserProfile,
  getUserInfo,
  validateProfileCompletion,
  formatNyscDetails,
  getNigerianStateCodes,
  getStateNameFromCode
};
