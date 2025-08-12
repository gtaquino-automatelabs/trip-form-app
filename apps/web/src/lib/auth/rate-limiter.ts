interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private maxAttempts: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;

    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Clean up every hour
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.attempts.entries()) {
      if (now > value.resetTime) {
        this.attempts.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.attempts.clear();
  }

  getTimeUntilReset(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;
    
    const now = Date.now();
    return Math.max(0, attempt.resetTime - now);
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return this.maxAttempts;
    
    const now = Date.now();
    if (now > attempt.resetTime) {
      return this.maxAttempts;
    }
    
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}

// Create singleton instances for different purposes
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);
export const signupRateLimiter = new RateLimiter(5, 15 * 60 * 1000);
export const resetPasswordRateLimiter = new RateLimiter(3, 60 * 60 * 1000);