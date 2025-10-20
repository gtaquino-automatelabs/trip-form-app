import type { TravelRequestFormData } from '@/schemas/travel-request';

interface QueuedSubmission {
  id: string;
  data: TravelRequestFormData;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

const QUEUE_KEY = 'travelForm_submissionQueue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

class SubmissionQueue {
  private queue: QueuedSubmission[] = [];
  private isProcessing = false;
  private listeners: Set<(queue: QueuedSubmission[]) => void> = new Set();

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  private loadQueue() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading submission queue:', error);
      this.queue = [];
    }
  }

  private saveQueue() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving submission queue:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.queue));
  }

  addToQueue(data: TravelRequestFormData): string {
    const submission: QueuedSubmission = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    this.queue.push(submission);
    this.saveQueue();
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return submission.id;
  }

  async processQueue() {
    if (this.isProcessing || !navigator.onLine) return;
    
    this.isProcessing = true;

    const pendingSubmissions = this.queue.filter(
      item => item.status === 'pending' && item.retryCount < MAX_RETRIES
    );

    for (const submission of pendingSubmissions) {
      try {
        submission.status = 'processing';
        this.saveQueue();

        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': submission.id
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          submission.status = 'completed';
          // Remove completed submissions after a delay
          setTimeout(() => this.removeFromQueue(submission.id), 60000);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        submission.retryCount++;
        submission.status = 'pending';
        submission.error = error instanceof Error ? error.message : 'Unknown error';

        if (submission.retryCount >= MAX_RETRIES) {
          submission.status = 'failed';
        } else {
          // Schedule retry
          setTimeout(() => this.processQueue(), RETRY_DELAY * submission.retryCount);
        }
      }
      
      this.saveQueue();
    }

    this.isProcessing = false;
  }

  removeFromQueue(id: string) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  clearCompleted() {
    this.queue = this.queue.filter(item => item.status !== 'completed');
    this.saveQueue();
  }

  clearAll() {
    this.queue = [];
    this.saveQueue();
  }

  getQueue(): QueuedSubmission[] {
    return [...this.queue];
  }

  getQueuedCount(): number {
    return this.queue.filter(item => item.status === 'pending').length;
  }

  subscribe(listener: (queue: QueuedSubmission[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const submissionQueue = new SubmissionQueue();
export type { QueuedSubmission };