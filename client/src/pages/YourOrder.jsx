import React from "react";
import { useBook } from "../context/Booking";
import { FaHome, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookingManagement = () => {
  const [book, setBook] = useBook();
  const navigate = useNavigate();

  const handleCheckout = async (orderId, postId) => {
    try {
      const updatedBooking = book.filter((item) => item._id !== orderId);
      setBook(updatedBooking);
      localStorage.setItem("booking", JSON.stringify(updatedBooking));
      
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/booking/update-availability`,
        {
          postId,
          isAvailable: true,
        }
      );
      
      toast.success("Booking completed successfully!");
      navigate("/thank-you");
    } catch (error) {
      console.error("Error during checkout:", error.message);
      toast.error("Failed to complete the booking. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mcan-primary mb-2">Your Bookings</h1>
        <p className="text-gray-600">Manage your accommodation bookings and reservations</p>
      </div>

      {book && Array.isArray(book) && book.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {book.map((booking, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105"
            >
              {/* Booking Header */}
              <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{booking.title}</h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {booking.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <FaHome className="text-mcan-primary mt-1" />
                  <div>
                    <p className="text-gray-600">Accommodation Type</p>
                    <p className="font-medium text-gray-800">{booking.accommodationType || 'Standard Room'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FaMapMarkerAlt className="text-mcan-primary mt-1" />
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium text-gray-800">{booking.location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FaCalendarAlt className="text-mcan-primary mt-1" />
                  <div>
                    <p className="text-gray-600">Booking Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-mcan-primary">
                        ₦{booking.amount?.toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                      onClick={() => handleCheckout(booking._id, booking.postId)}
                    >
                      <FaCheckCircle />
                      <span>Complete Booking</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <FaHome className="text-mcan-primary w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Bookings</h3>
          <p className="text-gray-600 mb-6">You haven't made any accommodation bookings yet.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <FaHome className="mr-2" />
            Find Accommodation
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
