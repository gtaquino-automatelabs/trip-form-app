interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: {
    userId?: string;
    action?: string;
    formSection?: string;
    component?: string;
    url?: string;
    userAgent?: string;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for unhandled errors
      window.addEventListener('error', this.handleWindowError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      
      // Flush logs on page unload
      window.addEventListener('beforeunload', () => this.flush());
      
      // Start periodic flush
      this.startPeriodicFlush();
    }
  }

  private handleWindowError(event: ErrorEvent) {
    this.logError({
      message: event.message,
      error: {
        name: 'WindowError',
        message: event.message,
        stack: event.error?.stack,
      },
      context: {
        url: event.filename,
        component: 'window',
      },
      metadata: {
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.logError({
      message: `Unhandled Promise Rejection: ${event.reason}`,
      error: {
        name: 'UnhandledRejection',
        message: String(event.reason),
        stack: event.reason?.stack,
      },
      context: {
        component: 'promise',
      },
    });
  }

  private startPeriodicFlush() {
    this.flushTimer = setInterval(() => {
      if (this.logs.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private getUserContext(): Partial<ErrorLogEntry['context']> {
    if (typeof window === 'undefined') return {};
    
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      // Add user ID from session if available
      userId: this.getUserId(),
    };
  }

  private getUserId(): string | undefined {
    // Try to get user ID from localStorage or session
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.userId;
      }
    } catch (error) {
      // Ignore errors getting user ID
    }
    return undefined;
  }

  public logError(params: {
    message: string;
    error?: Error | { name: string; message: string; stack?: string };
    context?: ErrorLogEntry['context'];
    metadata?: Record<string, any>;
  }) {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: params.message,
      context: {
        ...this.getUserContext(),
        ...params.context,
      },
      error: params.error
        ? {
            name: params.error.name || 'Error',
            message: params.error.message || params.message,
            stack: params.error.stack,
          }
        : undefined,
      metadata: params.metadata,
    };

    this.addLog(entry);
  }

  public logWarning(message: string, context?: ErrorLogEntry['context']) {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warning',
      message,
      context: {
        ...this.getUserContext(),
        ...context,
      },
    };

    this.addLog(entry);
  }

  public logInfo(message: string, context?: ErrorLogEntry['context']) {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context: {
        ...this.getUserContext(),
        ...context,
      },
    };

    this.addLog(entry);
  }

  public logUserAction(action: string, metadata?: Record<string, any>) {
    this.logInfo(`User action: ${action}`, {
      action,
    });
    
    if (metadata) {
      this.logs[this.logs.length - 1].metadata = metadata;
    }
  }

  private addLog(entry: ErrorLogEntry) {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Auto-flush if we have enough logs
    if (this.logs.length >= this.batchSize) {
      this.flush();
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const method = entry.level === 'error' ? 'error' : entry.level === 'warning' ? 'warn' : 'log';
      // Use safe logging to avoid JSON.stringify issues with circular references
      console[method](
        `[${entry.level.toUpperCase()}] ${entry.message}`,
        {
          timestamp: entry.timestamp,
          level: entry.level,
          message: entry.message,
          context: entry.context,
          error: entry.error,
          metadata: entry.metadata
        }
      );
    }
  }

  public async flush() {
    if (this.logs.length === 0) return;
    
    const logsToSend = [...this.logs];
    this.logs = [];
    
    try {
      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logs: logsToSend }),
        });
      } else {
        // In development, just log to console with safe serialization
        console.group('Error Logger Flush');
        logsToSend.forEach(log => {
          // Use safe logging to avoid JSON.stringify issues
          console.log({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            context: log.context,
            error: log.error,
            metadata: log.metadata
          });
        });
        console.groupEnd();
      }
    } catch (error) {
      // If sending fails, add logs back to the queue
      this.logs = [...logsToSend, ...this.logs];
      console.error('Failed to send logs:', error);
    }
  }

  public clearLogs() {
    this.logs = [];
  }

  public getLogs() {
    return [...this.logs];
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Export helper functions
export const logError = errorLogger.logError.bind(errorLogger);
export const logWarning = errorLogger.logWarning.bind(errorLogger);
export const logInfo = errorLogger.logInfo.bind(errorLogger);
export const logUserAction = errorLogger.logUserAction.bind(errorLogger);