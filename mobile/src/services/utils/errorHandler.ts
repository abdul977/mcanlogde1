import { Alert } from 'react-native';
import { ERROR_MESSAGES } from '../../constants';

// Error types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isNetworkError?: boolean;
  isUserError?: boolean;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle different types of errors
  public handleError(error: any, severity: ErrorSeverity = ErrorSeverity.MEDIUM): void {
    const appError = this.normalizeError(error);
    
    // Log the error
    this.logError(appError, severity);

    // Show user-friendly message if needed
    if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) {
      this.showErrorToUser(appError);
    }

    // Report to crash analytics (in production)
    if (!__DEV__ && severity === ErrorSeverity.CRITICAL) {
      this.reportToCrashlytics(appError);
    }
  }

  // Normalize different error formats
  private normalizeError(error: any): AppError {
    if (error instanceof Error) {
      return error as AppError;
    }

    if (typeof error === 'string') {
      return new Error(error) as AppError;
    }

    if (error?.message) {
      const appError = new Error(error.message) as AppError;
      appError.code = error.code;
      appError.statusCode = error.statusCode;
      appError.isNetworkError = error.isNetworkError;
      return appError;
    }

    return new Error('Unknown error occurred') as AppError;
  }

  // Log error with context
  private logError(error: AppError, severity: ErrorSeverity): void {
    const timestamp = new Date().toISOString();
    const logLevel = this.getLogLevel(severity);

    const errorLog = {
      timestamp,
      level: logLevel,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      isNetworkError: error.isNetworkError,
    };

    if (__DEV__) {
      console.group(`🚨 ${logLevel.toUpperCase()} ERROR`);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      if (error.code) console.error('Code:', error.code);
      if (error.statusCode) console.error('Status Code:', error.statusCode);
      console.groupEnd();
    } else {
      // In production, you might want to send logs to a service
      console.error(JSON.stringify(errorLog));
    }
  }

  // Show error to user
  private showErrorToUser(error: AppError): void {
    const userMessage = this.getUserFriendlyMessage(error);
    
    Alert.alert(
      'Error',
      userMessage,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  }

  // Get user-friendly error message
  private getUserFriendlyMessage(error: AppError): string {
    // Network errors
    if (error.isNetworkError || error.message.includes('Network Error')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // HTTP status code errors
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return ERROR_MESSAGES.VALIDATION_ERROR;
        case 401:
          return ERROR_MESSAGES.UNAUTHORIZED;
        case 403:
          return ERROR_MESSAGES.FORBIDDEN;
        case 404:
          return ERROR_MESSAGES.NOT_FOUND;
        case 500:
        case 502:
        case 503:
        case 504:
          return ERROR_MESSAGES.SERVER_ERROR;
        default:
          return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      }
    }

    // Return original message or fallback
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Get log level from severity
  private getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      default:
        return 'error';
    }
  }

  // Report to crash analytics (placeholder)
  private reportToCrashlytics(error: AppError): void {
    // TODO: Implement crash reporting service integration
    // Example: Crashlytics.recordError(error);
    console.log('Would report to crashlytics:', error.message);
  }
}

// Convenience functions
export const errorHandler = ErrorHandler.getInstance();

export const handleError = (error: any, severity?: ErrorSeverity) => {
  errorHandler.handleError(error, severity);
};

export const handleCriticalError = (error: any) => {
  errorHandler.handleError(error, ErrorSeverity.CRITICAL);
};

export const handleNetworkError = (error: any) => {
  const networkError = error as AppError;
  networkError.isNetworkError = true;
  errorHandler.handleError(networkError, ErrorSeverity.HIGH);
};

export const handleUserError = (error: any) => {
  const userError = error as AppError;
  userError.isUserError = true;
  errorHandler.handleError(userError, ErrorSeverity.LOW);
};
