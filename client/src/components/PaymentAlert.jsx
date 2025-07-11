import React from 'react';
import { FaBell, FaExclamationTriangle, FaCreditCard, FaClock, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PaymentAlert = ({ 
  type = 'info', 
  count = 0, 
  title, 
  message, 
  actionUrl, 
  actionText = 'View Details',
  onDismiss,
  className = '',
  size = 'normal'
}) => {
  const alertStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: FaBell,
      iconColor: 'text-blue-600'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: FaExclamationTriangle,
      iconColor: 'text-yellow-600'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: FaExclamationTriangle,
      iconColor: 'text-red-600'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: FaCheckCircle,
      iconColor: 'text-green-600'
    },
    payment: {
      container: 'bg-purple-50 border-purple-200 text-purple-800',
      icon: FaCreditCard,
      iconColor: 'text-purple-600'
    }
  };

  const style = alertStyles[type] || alertStyles.info;
  const IconComponent = style.icon;
  
  const sizeClasses = {
    small: 'p-2 text-xs',
    normal: 'p-3 text-sm',
    large: 'p-4 text-base'
  };

  if (count === 0 && type !== 'success') return null;

  return (
    <div className={`border rounded-lg ${style.container} ${sizeClasses[size]} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <h4 className="font-medium mb-1">
                  {title}
                  {count > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-50">
                      {count}
                    </span>
                  )}
                </h4>
              )}
              
              {message && (
                <p className="text-sm opacity-90">
                  {message}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              {actionUrl && (
                <Link
                  to={actionUrl}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-opacity-20 bg-current hover:bg-opacity-30 transition-colors"
                >
                  {actionText}
                </Link>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-current opacity-60 hover:opacity-80 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Specialized payment alert components
export const PaymentPendingAlert = ({ count, bookingId, onDismiss }) => (
  <PaymentAlert
    type="warning"
    count={count}
    title="Pending Payment Verifications"
    message={`${count} payment${count > 1 ? 's' : ''} awaiting verification`}
    actionUrl="/admin/payment-verification"
    actionText="Review Payments"
    onDismiss={onDismiss}
  />
);

export const PaymentOverdueAlert = ({ count, onDismiss }) => (
  <PaymentAlert
    type="error"
    count={count}
    title="Overdue Payments"
    message={`${count} payment${count > 1 ? 's are' : ' is'} overdue`}
    actionUrl="/admin/payment-overview"
    actionText="View Overdue"
    onDismiss={onDismiss}
  />
);

export const PaymentSuccessAlert = ({ count, onDismiss }) => (
  <PaymentAlert
    type="success"
    count={count}
    title="Payments Processed"
    message={`${count} payment${count > 1 ? 's' : ''} successfully processed today`}
    actionUrl="/admin/payment-overview"
    actionText="View Summary"
    onDismiss={onDismiss}
  />
);

export const BookingPaymentAlert = ({ booking, pendingCount, overdueCount }) => {
  if (!pendingCount && !overdueCount) return null;
  
  const type = overdueCount > 0 ? 'error' : 'warning';
  const title = overdueCount > 0 ? 'Overdue Payments' : 'Pending Payments';
  const message = overdueCount > 0 
    ? `${overdueCount} overdue payment${overdueCount > 1 ? 's' : ''}`
    : `${pendingCount} pending payment${pendingCount > 1 ? 's' : ''}`;
  
  return (
    <PaymentAlert
      type={type}
      title={title}
      message={message}
      actionUrl={`/admin/payment-verification?booking=${booking._id}`}
      actionText="Review"
      size="small"
      className="mt-2"
    />
  );
};

// Notification badge component
export const PaymentNotificationBadge = ({ count, type = 'warning', size = 'normal' }) => {
  if (count === 0) return null;
  
  const sizeClasses = {
    small: 'w-4 h-4 text-xs',
    normal: 'w-5 h-5 text-xs',
    large: 'w-6 h-6 text-sm'
  };
  
  const typeClasses = {
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white'
  };
  
  return (
    <span className={`inline-flex items-center justify-center ${sizeClasses[size]} ${typeClasses[type]} rounded-full font-medium`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

// Alert container for multiple alerts
export const PaymentAlertContainer = ({ children, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {children}
  </div>
);

export default PaymentAlert;
