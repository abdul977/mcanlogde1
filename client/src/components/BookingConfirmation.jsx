import React, { useState } from "react";
import { FaCalendarAlt, FaUsers, FaPhone, FaMapMarkerAlt, FaTimes, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const BookingConfirmation = ({ 
  isOpen, 
  onClose, 
  accommodation, 
  bookingType = "accommodation",
  program = null,
  onBookingSuccess 
}) => {
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    bookingDuration: 1,
    numberOfGuests: 1,
    userNotes: "",
    contactInfo: {
      phone: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: ""
      }
    },
    enrollmentDetails: {
      previousExperience: "",
      expectations: "",
      specialRequirements: ""
    }
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      if (grandchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (bookingType === "accommodation") {
      if (!formData.checkInDate) {
        toast.error("Please select check-in date");
        return false;
      }

      if (!formData.bookingDuration || formData.bookingDuration < 1) {
        toast.error("Please select booking duration");
        return false;
      }

      const checkIn = new Date(formData.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        toast.error("Check-in date cannot be in the past");
        return false;
      }

      // Validate booking duration is within limits (max 12 months)
      if (formData.bookingDuration > 12) {
        toast.error("Maximum booking duration is 12 months");
        return false;
      }
      
      if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
        toast.error("Please specify number of guests");
        return false;
      }
    }
    
    if (!formData.contactInfo.phone) {
      toast.error("Please provide a contact phone number");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const bookingData = {
        bookingType,
        userNotes: formData.userNotes,
        contactInfo: formData.contactInfo
      };

      if (bookingType === "accommodation") {
        bookingData.accommodationId = accommodation._id;
        bookingData.checkInDate = formData.checkInDate;
        // Calculate check-out date based on duration
        const checkOutDate = new Date(formData.checkInDate);
        checkOutDate.setMonth(checkOutDate.getMonth() + parseInt(formData.bookingDuration || 1));
        bookingData.checkOutDate = checkOutDate.toISOString().split('T')[0];
        bookingData.bookingDuration = {
          months: parseInt(formData.bookingDuration || 1),
          startDate: formData.checkInDate,
          endDate: checkOutDate.toISOString().split('T')[0]
        };
        bookingData.numberOfGuests = formData.numberOfGuests;
        bookingData.totalAmount = accommodation.price * parseInt(formData.bookingDuration || 1);
      } else {
        bookingData.programId = program._id;
        bookingData.programModel = program.model || "QuranClass";
        bookingData.enrollmentDetails = formData.enrollmentDetails;
      }

      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;

      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/create`,
        bookingData,
        {
          headers: {
            Authorization: token
          }
        }
      );

      if (response.data.success) {
        toast.success("Booking request submitted successfully! You will receive a confirmation once reviewed by admin.");
        onBookingSuccess && onBookingSuccess(response.data.booking);
        onClose();
        
        // Reset form
        setFormData({
          checkInDate: "",
          checkOutDate: "",
          numberOfGuests: 1,
          userNotes: "",
          contactInfo: {
            phone: "",
            emergencyContact: {
              name: "",
              phone: "",
              relationship: ""
            }
          },
          enrollmentDetails: {
            previousExperience: "",
            expectations: "",
            specialRequirements: ""
          }
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit booking request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {bookingType === "accommodation" ? "Book Accommodation" : "Enroll in Program"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">
              {bookingType === "accommodation" ? accommodation?.title : program?.title}
            </h3>
            {bookingType === "accommodation" ? (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  {accommodation?.location}
                </div>
                <div className="flex items-center">
                  <FaUsers className="mr-2" />
                  {accommodation?.accommodationType} • Max {accommodation?.guest} guests
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    Monthly Rate: ₦{accommodation?.price?.toLocaleString()}
                  </div>
                  {formData.bookingDuration && formData.bookingDuration > 1 && (
                    <div className="text-lg font-semibold text-green-600">
                      Total ({formData.bookingDuration} months): ₦{(accommodation?.price * (formData.bookingDuration || 1))?.toLocaleString()}
                    </div>
                  )}
                  {(!formData.bookingDuration || formData.bookingDuration === 1) && (
                    <div className="text-lg font-semibold text-green-600">
                      ₦{accommodation?.price?.toLocaleString()}/month
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-gray-600">
                <p>{program?.description}</p>
                {program?.instructor && (
                  <p><strong>Instructor:</strong> {program.instructor.name}</p>
                )}
                {program?.schedule && (
                  <p><strong>Schedule:</strong> {program.schedule.time}</p>
                )}
              </div>
            )}
          </div>

          {/* Booking Details */}
          {bookingType === "accommodation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Duration *
                </label>
                <select
                  name="bookingDuration"
                  value={formData.bookingDuration || 1}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  required
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum booking duration is 12 months
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <select
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  required
                >
                  {[...Array(accommodation?.guest || 6)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guest{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Payment Schedule Preview for Accommodations */}
          {bookingType === "accommodation" && formData.bookingDuration > 1 && formData.checkInDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <FaCalendarAlt className="mr-2" />
                Payment Schedule Preview
              </h4>
              <div className="space-y-2 text-sm">
                {[...Array(parseInt(formData.bookingDuration || 1))].map((_, i) => {
                  const dueDate = new Date(formData.checkInDate);
                  dueDate.setMonth(dueDate.getMonth() + i);
                  return (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-blue-100 last:border-b-0">
                      <span className="text-blue-700">
                        Month {i + 1}: {dueDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-semibold text-blue-800">
                        ₦{accommodation?.price?.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-blue-200">
                  <div className="flex justify-between items-center font-semibold text-blue-800">
                    <span>Total Amount:</span>
                    <span>₦{(accommodation?.price * (formData.bookingDuration || 1))?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">
                💡 You'll receive monthly payment reminders and can upload payment proofs for verification.
              </p>
            </div>
          )}

          {/* Program Enrollment Details */}
          {bookingType !== "accommodation" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Experience
                </label>
                <textarea
                  name="enrollmentDetails.previousExperience"
                  value={formData.enrollmentDetails.previousExperience}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="Tell us about your previous experience with this subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expectations
                </label>
                <textarea
                  name="enrollmentDetails.expectations"
                  value={formData.enrollmentDetails.expectations}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="What do you hope to achieve from this program?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  name="enrollmentDetails.specialRequirements"
                  value={formData.enrollmentDetails.specialRequirements}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="Any special accommodations needed?"
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Contact Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                placeholder="+234 xxx xxx xxxx"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="contactInfo.emergencyContact.name"
                  value={formData.contactInfo.emergencyContact.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactInfo.emergencyContact.phone"
                  value={formData.contactInfo.emergencyContact.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  name="contactInfo.emergencyContact.relationship"
                  value={formData.contactInfo.emergencyContact.relationship}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="e.g., Parent, Spouse"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="userNotes"
              value={formData.userNotes}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              placeholder="Any additional information or special requests..."
              maxLength="500"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.userNotes.length}/500 characters
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Important Notice</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your booking request will be reviewed by our admin team</li>
              <li>• You will receive a confirmation message once approved</li>
              <li>• Payment arrangements will be communicated separately</li>
              <li>• You can track your booking status in your dashboard</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-mcan-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingConfirmation;
