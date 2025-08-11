# Frontend Architecture

### Component Architecture

#### Component Organization
```
apps/web/src/components/
├── ui/                      # shadcn/ui components
│   ├── button.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── toast.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/                  # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── background.tsx
│   └── session-warning.tsx # Session timeout warning
├── form/                    # Form-specific components
│   ├── form-state-machine.tsx # XState form orchestrator
│   ├── form-layout.tsx     # Multi-step form wrapper
│   ├── progress-bar.tsx    # Form progress indicator
│   ├── navigation.tsx      # Smart navigation with state
│   ├── conditional-page.tsx # Conditional page wrapper
│   ├── validation/         # Real-time validation
│   │   ├── field-validator.tsx
│   │   ├── validators.ts
│   │   └── error-messages.ts
│   └── pages/             # Individual form pages
│       ├── passenger-data.tsx
│       ├── travel-details.tsx
│       ├── expense-type.tsx
│       ├── preferences.tsx
│       ├── international.tsx
│       ├── time-restrictions.tsx
│       ├── flight-upload.tsx
│       ├── trip-objective.tsx
│       └── review-submit.tsx
├── my-requests/             # User request management
│   ├── request-list.tsx
│   ├── request-card.tsx
│   ├── request-filters.tsx
│   ├── draft-badge.tsx
│   ├── cancel-dialog.tsx
│   └── edit-draft-button.tsx
├── admin/                   # Admin dashboard components
│   ├── requests-table.tsx
│   ├── request-detail.tsx
│   ├── status-badge.tsx
│   ├── filters-advanced.tsx
│   ├── bulk-actions.tsx    # Bulk operations toolbar
│   ├── export-dialog.tsx   # CSV/Excel export
│   ├── reports/            # Analytics components
│   │   ├── dashboard-chart.tsx
│   │   ├── metrics-card.tsx
│   │   └── trend-graph.tsx
│   └── audit-trail.tsx     # Status history viewer
└── auth/                    # Authentication components
    ├── login-form.tsx
    ├── signup-form.tsx
    ├── forgot-password.tsx  # Password recovery
    ├── reset-password.tsx
    ├── auth-guard.tsx
    └── sso-buttons.tsx     # Google/Microsoft SSO
```

#### Component Template
```typescript
// Example: Form page component template
'use client';

import { useFormStore } from '@/stores/form-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const pageSchema = z.object({
  passengerName: z.string().min(1, 'Nome é obrigatório'),
  passengerEmail: z.string().email('Email inválido'),
  // ... other fields
});

type PageData = z.infer<typeof pageSchema>;

interface PassengerDataPageProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function PassengerDataPage({ onNext, onPrevious }: PassengerDataPageProps) {
  const { formData, updateFormData } = useFormStore();
  
  const form = useForm<PageData>({
    resolver: zodResolver(pageSchema),
    defaultValues: formData.passengerData || {},
  });
  
  const handleSubmit = (data: PageData) => {
    updateFormData({ passengerData: data });
    onNext();
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Form fields */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button type="submit">
          Próximo
        </Button>
      </div>
    </form>
  );
}
```

### State Management Architecture

#### State Structure

##### Form Flow State Machine
```typescript
// machines/form-machine.ts
import { createMachine, assign } from 'xstate';

export const formMachine = createMachine({
  id: 'travelForm',
  initial: 'passengerData',
  context: {
    currentStep: 1,
    totalSteps: 8,
    formData: {},
    visitedPages: [],
    conditionalPages: {
      international: false,
      timeRestrictions: false,
      flightUpload: false
    }
  },
  states: {
    passengerData: {
      on: {
        NEXT: {
          target: 'travelDetails',
          actions: ['savePageData', 'markVisited']
        }
      }
    },
    travelDetails: {
      on: {
        NEXT: {
          target: 'expenseType',
          actions: ['savePageData', 'checkInternational']
        },
        PREVIOUS: 'passengerData'
      }
    },
    expenseType: {
      on: {
        SELECT_FULL: {
          target: 'preferences',
          actions: ['saveExpenseType', 'enableAllPages']
        },
        SELECT_TICKETS_ONLY: {
          target: 'checkInternational',
          actions: ['saveExpenseType', 'disablePerDiem']
        },
        SELECT_PERDIEM_ONLY: {
          target: 'preferences',
          actions: ['saveExpenseType', 'disableFlights']
        },
        PREVIOUS: 'travelDetails'
      }
    },
    preferences: {
      on: {
        NEXT: 'checkInternational',
        PREVIOUS: 'expenseType'
      }
    },
    checkInternational: {
      always: [
        {
          target: 'international',
          cond: 'isInternationalTrip'
        },
        {
          target: 'checkTimeRestrictions'
        }
      ]
    },
    international: {
      on: {
        NEXT: 'checkTimeRestrictions',
        PREVIOUS: 'preferences'
      }
    },
    checkTimeRestrictions: {
      always: [
        {
          target: 'timeRestrictions',
          cond: 'hasTimeRestrictions'
        },
        {
          target: 'checkFlightUpload'
        }
      ]
    },
    timeRestrictions: {
      on: {
        NEXT: 'checkFlightUpload',
        PREVIOUS: 'conditionalPrevious'
      }
    },
    checkFlightUpload: {
      always: [
        {
          target: 'flightUpload',
          cond: 'wantsFlightSuggestions'
        },
        {
          target: 'tripObjective'
        }
      ]
    },
    flightUpload: {
      on: {
        NEXT: 'tripObjective',
        PREVIOUS: 'conditionalPrevious'
      }
    },
    tripObjective: {
      on: {
        NEXT: 'review',
        PREVIOUS: 'conditionalPrevious'
      }
    },
    review: {
      on: {
        SUBMIT: 'submitting',
        PREVIOUS: 'tripObjective',
        EDIT: {
          target: 'editing',
          actions: 'setEditTarget'
        }
      }
    },
    submitting: {
      invoke: {
        src: 'submitForm',
        onDone: 'success',
        onError: 'error'
      }
    },
    success: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'submitting',
        BACK: 'review'
      }
    }
  }
});
```

##### Global App State
```typescript
// stores/app-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // User session
  user: User | null;
  sessionExpiresAt: Date | null;
  
  // Form drafts
  drafts: Map<string, Partial<TravelRequestInput>>;
  currentDraftId: string | null;
  
  // My requests
  myRequests: TravelRequest[];
  myRequestsFilter: RequestFilter;
  
  // Actions
  setUser: (user: User | null) => void;
  saveDraft: (id: string, data: Partial<TravelRequestInput>) => void;
  loadDraft: (id: string) => Partial<TravelRequestInput> | undefined;
  deleteDraft: (id: string) => void;
  setMyRequests: (requests: TravelRequest[]) => void;
  updateRequestFilter: (filter: Partial<RequestFilter>) => void;
  
  // Session management
  updateSessionExpiry: (expiresAt: Date) => void;
  getTimeUntilExpiry: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionExpiresAt: null,
      drafts: new Map(),
      currentDraftId: null,
      myRequests: [],
      myRequestsFilter: {
        status: 'all',
        dateRange: 'all',
        search: ''
      },
      
      setUser: (user) => set({ user }),
      
      saveDraft: (id, data) => 
        set((state) => {
          const drafts = new Map(state.drafts);
          drafts.set(id, data);
          return { drafts, currentDraftId: id };
        }),
      
      loadDraft: (id) => get().drafts.get(id),
      
      deleteDraft: (id) =>
        set((state) => {
          const drafts = new Map(state.drafts);
          drafts.delete(id);
          return { drafts };
        }),
      
      setMyRequests: (requests) => set({ myRequests: requests }),
      
      updateRequestFilter: (filter) =>
        set((state) => ({
          myRequestsFilter: { ...state.myRequestsFilter, ...filter }
        })),
      
      updateSessionExpiry: (expiresAt) => set({ sessionExpiresAt: expiresAt }),
      
      getTimeUntilExpiry: () => {
        const expiry = get().sessionExpiresAt;
        if (!expiry) return Infinity;
        return expiry.getTime() - Date.now();
      }
    }),
    {
      name: 'travel-app-storage',
      partialize: (state) => ({
        drafts: state.drafts,
        myRequestsFilter: state.myRequestsFilter
      })
    }
  )
);
```

#### State Management Patterns
- **Dual state architecture:** XState for form flow, Zustand for app state
- **Form flow state machine:** Handles conditional navigation and page transitions
- **Draft persistence:** Auto-save to localStorage every 30 seconds
- **Session management:** Active monitoring with 5-minute warning before expiry
- **Optimistic updates:** UI updates before server confirmation with rollback
- **Request caching:** My requests cached with smart invalidation
- **Filter persistence:** User filters saved across sessions

### Routing Architecture

#### Route Organization
```
apps/web/src/app/
├── (auth)/                  # Auth group layout
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx
├── (protected)/             # Protected routes
│   ├── form/
│   │   ├── layout.tsx      # Form layout with state machine
│   │   └── page.tsx        # Single page with dynamic content
│   ├── my-requests/        # User's requests
│   │   ├── page.tsx        # Request list
│   │   └── [id]/
│   │       ├── page.tsx    # Request detail
│   │       └── edit/
│   │           └── page.tsx # Edit draft
│   ├── confirmation/
│   │   └── [id]/
│   │       └── page.tsx    # Confirmation with protocol
│   └── admin/
│       ├── layout.tsx      # Admin layout
│       ├── page.tsx        # Dashboard with metrics
│       ├── requests/
│       │   ├── page.tsx    # All requests table
│       │   └── [id]/
│       │       └── page.tsx # Request detail with audit
│       ├── reports/
│       │   └── page.tsx    # Analytics dashboard
│       ├── export/
│       │   └── page.tsx    # Export center
│       └── settings/
│           └── page.tsx    # System configuration
├── api/                     # API routes
│   ├── auth/
│   │   ├── login/
│   │   ├── logout/
│   │   ├── session/
│   │   ├── reset-password/
│   │   └── verify-token/
│   ├── form/
│   │   ├── submit/
│   │   ├── draft/
│   │   └── validate/       # Field validation
│   ├── requests/           # User requests
│   │   ├── route.ts        # List requests
│   │   └── [id]/
│   │       ├── route.ts    # Get/Update/Delete
│   │       └── cancel/
│   ├── upload/
│   │   ├── passport/
│   │   └── flight-suggestion/
│   ├── admin/
│   │   ├── requests/
│   │   │   ├── route.ts
│   │   │   ├── bulk/       # Bulk operations
│   │   │   └── [id]/
│   │   │       └── status/ # Update status
│   │   ├── export/
│   │   │   ├── csv/
│   │   │   └── excel/
│   │   └── reports/
│   │       └── dashboard/
│   └── webhooks/           # External integrations
│       └── supabase/
├── layout.tsx               # Root layout
└── page.tsx                 # Landing/redirect
```

#### Protected Route Pattern
```typescript
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

### Frontend Services Layer

#### API Client Setup
```typescript
// services/api-client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

class ApiClient {
  private supabase = createClientComponentClient();
  
  private async getAuthHeaders() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  }
  
  async post<T>(url: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async get<T>(url: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async put<T>(url: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async delete<T>(url: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async uploadFile(file: File, category: 'passport' | 'flight_suggestion'): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data: { session } } = await this.supabase.auth.getSession();
    
    const response = await fetch(`/api/upload/${category}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

#### Service Examples
```typescript
// services/form-service.ts
import { apiClient } from './api-client';
import { TravelRequestInput } from '@/types';

export const formService = {
  async submitForm(data: TravelRequestInput) {
    return apiClient.post<{ id: string; requestNumber: string }>(
      '/api/form/submit',
      data
    );
  },
  
  async saveDraft(data: Partial<TravelRequestInput>) {
    return apiClient.post('/api/form/draft', data);
  },
  
  async getDraft() {
    return apiClient.get<Partial<TravelRequestInput>>('/api/form/draft');
  },
  
  async validateField(field: string, value: any) {
    return apiClient.post<{ valid: boolean; error?: string }>(
      '/api/form/validate',
      { field, value }
    );
  },
  
  async uploadPassport(file: File) {
    return apiClient.uploadFile(file, 'passport');
  },
  
  async uploadFlightSuggestion(file: File) {
    return apiClient.uploadFile(file, 'flight_suggestion');
  },
};

// services/request-service.ts
export const requestService = {
  async getMyRequests(filter?: RequestFilter) {
    const params = new URLSearchParams(filter as any);
    return apiClient.get<TravelRequest[]>(`/api/requests?${params}`);
  },
  
  async getRequest(id: string) {
    return apiClient.get<TravelRequest>(`/api/requests/${id}`);
  },
  
  async updateDraft(id: string, data: Partial<TravelRequestInput>) {
    return apiClient.put(`/api/requests/${id}`, data);
  },
  
  async cancelRequest(id: string, reason: string) {
    return apiClient.post(`/api/requests/${id}/cancel`, { reason });
  },
  
  async deleteRequest(id: string) {
    return apiClient.delete(`/api/requests/${id}`);
  },
};

// services/admin-service.ts
export const adminService = {
  async getRequests(filters: AdminFilter, pagination: Pagination) {
    const params = new URLSearchParams({ ...filters, ...pagination } as any);
    return apiClient.get<PaginatedResponse<TravelRequest>>(
      `/api/admin/requests?${params}`
    );
  },
  
  async updateStatus(id: string, status: string, comment?: string) {
    return apiClient.post(`/api/admin/requests/${id}/status`, {
      status,
      comment
    });
  },
  
  async bulkUpdateStatus(ids: string[], status: string) {
    return apiClient.post('/api/admin/requests/bulk', {
      ids,
      action: 'updateStatus',
      status
    });
  },
  
  async exportRequests(format: 'csv' | 'excel', filters?: AdminFilter) {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`/api/admin/export/${format}?${params}`, {
      headers: await apiClient.getAuthHeaders()
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
  
  async getDashboardMetrics() {
    return apiClient.get<DashboardMetrics>('/api/admin/reports/dashboard');
  },
};
```

### Hooks and Custom Utilities

#### Session Management Hook
```typescript
// hooks/useSessionWarning.tsx
import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Dialog } from '@/components/ui/dialog';

export function useSessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const { sessionExpiresAt, updateSessionExpiry } = useAppStore();
  
  useEffect(() => {
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes
    
    const checkSession = setInterval(() => {
      if (!sessionExpiresAt) return;
      
      const timeLeft = sessionExpiresAt.getTime() - Date.now();
      
      if (timeLeft < WARNING_TIME && timeLeft > 0 && !showWarning) {
        setShowWarning(true);
      } else if (timeLeft <= 0) {
        // Force logout
        window.location.href = '/login';
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(checkSession);
  }, [sessionExpiresAt, showWarning]);
  
  const extendSession = async () => {
    const response = await fetch('/api/auth/session', { method: 'POST' });
    const { expiresAt } = await response.json();
    updateSessionExpiry(new Date(expiresAt));
    setShowWarning(false);
  };
  
  return {
    showWarning,
    extendSession,
    timeLeft: sessionExpiresAt ? 
      Math.max(0, sessionExpiresAt.getTime() - Date.now()) : null
  };
}

// hooks/useFormValidation.ts
import { useCallback, useState } from 'react';
import { formService } from '@/services/form-service';
import debounce from 'lodash/debounce';

export function useFieldValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  
  const validateField = useCallback(
    debounce(async (field: string, value: any) => {
      setValidating(prev => ({ ...prev, [field]: true }));
      
      try {
        const result = await formService.validateField(field, value);
        
        if (!result.valid) {
          setErrors(prev => ({ ...prev, [field]: result.error || '' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      } finally {
        setValidating(prev => ({ ...prev, [field]: false }));
      }
    }, 500),
    []
  );
  
  return { errors, validating, validateField };
}
```
