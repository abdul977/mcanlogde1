import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaClock, FaMoneyBillWave, FaTimes, FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/UserContext";

const PaymentAlerts = ({ onUploadClick }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const { auth } = useAuth();

  useEffect(() => {
    if (auth?.token) {
      fetchPaymentAlerts();
    }
  }, [auth]);

  const fetchPaymentAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/user`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const bookingsWithPayments = response.data.bookings.filter(
          booking => booking.paymentSchedule && booking.paymentSchedule.length > 0
        );

        const currentAlerts = [];
        const now = new Date();

        bookingsWithPayments.forEach(booking => {
          booking.paymentSchedule?.forEach(payment => {
            const dueDate = new Date(payment.dueDate);
            const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            
            // Create alerts for different scenarios
            if (payment.status === 'pending') {
              if (daysDiff < 0) {
                // Overdue
                currentAlerts.push({
                  id: `${booking._id}-${payment.monthNumber}`,
                  type: 'overdue',
                  priority: 'high',
                  booking,
                  payment,
                  daysDiff: Math.abs(daysDiff),
                  message: `Payment for ${booking.accommodation?.title} Month ${payment.monthNumber} is ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} overdue`
                });
              } else if (daysDiff <= 7) {
                // Due soon
                currentAlerts.push({
                  id: `${booking._id}-${payment.monthNumber}`,
                  type: 'due_soon',
                  priority: daysDiff <= 3 ? 'high' : 'medium',
                  booking,
                  payment,
                  daysDiff,
                  message: `Payment for ${booking.accommodation?.title} Month ${payment.monthNumber} is due in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`
                });
              }
            }
          });
        });

        // Filter out dismissed alerts
        const filteredAlerts = currentAlerts.filter(
          alert => !dismissedAlerts.includes(alert.id)
        );

        setAlerts(filteredAlerts);
      }
    } catch (error) {
      console.error("Error fetching payment alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleUploadPayment = (alert) => {
    if (onUploadClick) {
      onUploadClick(alert.booking, alert.payment.monthNumber, alert.payment.amount);
    }
  };

  const getAlertStyles = (type, priority) => {
    const baseStyles = "border-l-4 p-4 rounded-r-lg shadow-sm";
    
    if (type === 'overdue') {
      return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
    } else if (type === 'due_soon') {
      if (priority === 'high') {
        return `${baseStyles} bg-orange-50 border-orange-400 text-orange-800`;
      } else {
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      }
    }
    return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
  };

  const getAlertIcon = (type) => {
    if (type === 'overdue') {
      return <FaExclamationTriangle className="w-5 h-5 text-red-600" />;
    } else if (type === 'due_soon') {
      return <FaClock className="w-5 h-5 text-orange-600" />;
    }
    return <FaMoneyBillWave className="w-5 h-5 text-blue-600" />;
  };

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <FaExclamationTriangle className="text-orange-500" />
        Payment Alerts
      </h3>
      
      {alerts.map((alert) => (
        <div key={alert.id} className={getAlertStyles(alert.type, alert.priority)}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="font-medium">
                  {alert.type === 'overdue' ? 'Overdue Payment' : 'Payment Due Soon'}
                </div>
                <div className="text-sm mt-1">
                  {alert.message}
                </div>
                <div className="text-xs mt-2 opacity-75">
                  Amount: ₦{alert.payment.amount?.toLocaleString()} • 
                  Due: {new Date(alert.payment.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleUploadPayment(alert)}
                className="bg-white text-gray-700 border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <FaUpload className="w-3 h-3" />
                Upload Payment
              </button>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Dismiss alert"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentAlerts;
