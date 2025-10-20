import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { errorLogger, logError, logWarning, logInfo, logUserAction } from '@/lib/error-logger';

describe('Error Logging', () => {
  let fetchSpy: any;
  let consoleSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);
    
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
    };

    errorLogger.clearLogs();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  it('should log errors with context', () => {
    const error = new Error('Test error');
    
    logError({
      message: 'Something went wrong',
      error,
      context: {
        action: 'form_submit',
        formSection: 'passenger_data'
      }
    });

    const logs = errorLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'error',
      message: 'Something went wrong',
      context: expect.objectContaining({
        action: 'form_submit',
        formSection: 'passenger_data'
      }),
      error: expect.objectContaining({
        name: 'Error',
        message: 'Test error'
      })
    });
  });

  it('should log warnings', () => {
    logWarning('Low disk space', { component: 'file-upload' });

    const logs = errorLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'warning',
      message: 'Low disk space',
      context: expect.objectContaining({
        component: 'file-upload'
      })
    });
  });

  it('should log info messages', () => {
    logInfo('User logged in', { userId: 'user123' });

    const logs = errorLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'info',
      message: 'User logged in',
      context: expect.objectContaining({
        userId: 'user123'
      })
    });
  });

  it('should log user actions', () => {
    logUserAction('button_click', { buttonId: 'submit-btn' });

    const logs = errorLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'info',
      message: 'User action: button_click',
      context: expect.objectContaining({
        action: 'button_click'
      }),
      metadata: { buttonId: 'submit-btn' }
    });
  });

  it('should include timestamp in logs', () => {
    logInfo('Test message');

    const logs = errorLogger.getLogs();
    expect(logs[0].timestamp).toBeDefined();
    expect(new Date(logs[0].timestamp)).toBeInstanceOf(Date);
  });

  it('should include user context automatically', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/form' },
      writable: true
    });

    logInfo('Test message');

    const logs = errorLogger.getLogs();
    expect(logs[0].context).toMatchObject({
      url: 'http://localhost:3000/form',
      userAgent: expect.any(String)
    });
  });

  it('should flush logs when batch size is reached', async () => {
    // Add 10 logs (batch size)
    for (let i = 0; i < 10; i++) {
      logInfo(`Message ${i}`);
    }

    // In development, logs are logged to console
    expect(consoleSpy.group).toHaveBeenCalled();
    expect(consoleSpy.groupEnd).toHaveBeenCalled();
  });

  it('should limit maximum number of logs', () => {
    // Add more than max logs (100)
    for (let i = 0; i < 105; i++) {
      logInfo(`Message ${i}`);
    }

    const logs = errorLogger.getLogs();
    expect(logs.length).toBeLessThanOrEqual(100);
  });

  it('should handle window error events', () => {
    const errorEvent = new ErrorEvent('error', {
      message: 'Script error',
      filename: 'app.js',
      lineno: 10,
      colno: 15,
      error: new Error('Script error')
    });

    window.dispatchEvent(errorEvent);

    const logs = errorLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'error',
      message: 'Script error',
      error: expect.objectContaining({
        name: 'WindowError',
        message: 'Script error'
      }),
      metadata: {
        lineno: 10,
        colno: 15
      }
    });
  });

  it('should handle unhandled promise rejections', () => {
    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject('Test rejection'),
      reason: 'Test rejection'
    });

    window.dispatchEvent(rejectionEvent);

    const logs = errorLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'error',
      message: 'Unhandled Promise Rejection: Test rejection',
      error: expect.objectContaining({
        name: 'UnhandledRejection',
        message: 'Test rejection'
      })
    });
  });

  it('should clear logs', () => {
    logInfo('Message 1');
    logInfo('Message 2');
    
    expect(errorLogger.getLogs()).toHaveLength(2);
    
    errorLogger.clearLogs();
    
    expect(errorLogger.getLogs()).toHaveLength(0);
  });

  it('should log to console in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    logError({ message: 'Error message' });
    expect(consoleSpy.error).toHaveBeenCalled();

    logWarning('Warning message');
    expect(consoleSpy.warn).toHaveBeenCalled();

    logInfo('Info message');
    expect(consoleSpy.log).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });
});