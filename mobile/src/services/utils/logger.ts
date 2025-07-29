// Logging levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: __DEV__,
  enableStorage: !__DEV__,
  maxStoredLogs: 1000,
};

// Logger class
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logs: LogEntry[] = [];

  private constructor(config: LoggerConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  // Configure logger
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Debug level logging
  public debug(message: string, data?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  // Info level logging
  public info(message: string, data?: any, source?: string): void {
    this.log(LogLevel.INFO, message, data, source);
  }

  // Warning level logging
  public warn(message: string, data?: any, source?: string): void {
    this.log(LogLevel.WARN, message, data, source);
  }

  // Error level logging
  public error(message: string, data?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, data, source);
  }

  // Fatal level logging
  public fatal(message: string, data?: any, source?: string): void {
    this.log(LogLevel.FATAL, message, data, source);
  }

  // Generic log method
  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    // Check if log level meets minimum threshold
    if (level < this.config.minLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source,
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Storage logging
    if (this.config.enableStorage) {
      this.logToStorage(logEntry);
    }
  }

  // Log to console with appropriate styling
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const source = entry.source ? `[${entry.source}]` : '';
    
    const logMessage = `${timestamp} ${source} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`🐛 DEBUG: ${logMessage}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`ℹ️ INFO: ${logMessage}`, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`⚠️ WARN: ${logMessage}`, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`❌ ERROR: ${logMessage}`, entry.data || '');
        break;
      case LogLevel.FATAL:
        console.error(`💀 FATAL: ${logMessage}`, entry.data || '');
        break;
    }
  }

  // Store logs in memory (could be extended to persist to storage)
  private logToStorage(entry: LogEntry): void {
    this.logs.push(entry);

    // Maintain maximum log count
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs = this.logs.slice(-this.config.maxStoredLogs);
    }
  }

  // Get stored logs
  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Clear stored logs
  public clearLogs(): void {
    this.logs = [];
  }

  // Export logs as string
  public exportLogs(): string {
    return this.logs
      .map(log => {
        const levelName = LogLevel[log.level];
        const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
        const source = log.source ? ` | Source: ${log.source}` : '';
        return `${log.timestamp} | ${levelName} | ${log.message}${data}${source}`;
      })
      .join('\n');
  }

  // Get log statistics
  public getStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.logs.length,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level].toLowerCase();
      stats[levelName]++;
    });

    return stats;
  }
}

// Create default logger instance
export const logger = Logger.getInstance();

// Convenience functions
export const logDebug = (message: string, data?: any, source?: string) => {
  logger.debug(message, data, source);
};

export const logInfo = (message: string, data?: any, source?: string) => {
  logger.info(message, data, source);
};

export const logWarn = (message: string, data?: any, source?: string) => {
  logger.warn(message, data, source);
};

export const logError = (message: string, data?: any, source?: string) => {
  logger.error(message, data, source);
};

export const logFatal = (message: string, data?: any, source?: string) => {
  logger.fatal(message, data, source);
};
