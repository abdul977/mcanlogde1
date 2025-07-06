import React, { useState } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { updateUserProfile, getNigerianStateCodes } from '../services/userService';
import { toast } from 'react-toastify';

const ProfileEditModal = ({ isOpen, onClose, userProfile, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    stateCode: '',
    batch: '',
    stream: '',
    callUpNumber: '',
    phone: '',
    institution: '',
    course: ''
  });
  const [loading, setLoading] = useState(false);

  // Update form data when userProfile changes
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        gender: userProfile.gender || '',
        stateCode: userProfile.stateCode || '',
        batch: userProfile.batch || '',
        stream: userProfile.stream || '',
        callUpNumber: userProfile.callUpNumber || '',
        phone: userProfile.phone || '',
        institution: userProfile.institution || '',
        course: userProfile.course || ''
      });
    }
  }, [userProfile]);

  const stateCodes = getNigerianStateCodes();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only send fields that have values (allow partial updates)
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].toString().trim() !== '') {
          updateData[key] = formData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        toast.warning('Please fill in at least one field to update');
        setLoading(false);
        return;
      }

      const response = await updateUserProfile(updateData);
      if (response.success) {
        toast.success('Profile updated successfully!');
        onProfileUpdate(response.user);
        onClose();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* State Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State Code
              </label>
              <select
                name="stateCode"
                value={formData.stateCode}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              >
                <option value="">Select State</option>
                {stateCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch
              </label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                placeholder="e.g., 2024 Batch A"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              />
            </div>

            {/* Stream */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream
              </label>
              <select
                name="stream"
                value={formData.stream}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              >
                <option value="">Select Stream</option>
                <option value="A">Stream A</option>
                <option value="B">Stream B</option>
                <option value="C">Stream C</option>
              </select>
            </div>

            {/* Call-Up Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call-Up Number
              </label>
              <input
                type="text"
                name="callUpNumber"
                value={formData.callUpNumber}
                onChange={handleInputChange}
                placeholder="e.g., FCT/24A/1234"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +234 123 456 7890"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              />
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                placeholder="e.g., University of Lagos"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              />
            </div>

            {/* Course */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course of Study
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
