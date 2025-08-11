# Testing Strategy

### Testing Pyramid
```
          E2E Tests
         /        \
    Integration Tests
       /            \
  Frontend Unit  Backend Unit
```

### Test Organization

#### Frontend Tests
```
apps/web/tests/
├── unit/
│   ├── components/
│   │   ├── form-pages.test.tsx
│   │   └── ui-components.test.tsx
│   └── stores/
│       └── form-store.test.ts
├── integration/
│   ├── form-flow.test.tsx
│   └── auth-flow.test.tsx
└── setup.ts
```

#### Backend Tests
```
apps/web/tests/
├── api/
│   ├── auth.test.ts
│   ├── form-submit.test.ts
│   └── admin.test.ts
└── repositories/
    └── travel-request.test.ts
```

#### E2E Tests
```
e2e/
├── form-submission.spec.ts
├── admin-dashboard.spec.ts
└── auth-flow.spec.ts
```

### Test Examples

#### Frontend Component Test
```typescript
// tests/unit/components/passenger-data.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PassengerDataPage } from '@/components/form/pages/passenger-data';

describe('PassengerDataPage', () => {
  it('validates required fields', async () => {
    const onNext = vi.fn();
    render(<PassengerDataPage onNext={onNext} onPrevious={vi.fn()} />);
    
    const submitButton = screen.getByText('Próximo');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(onNext).not.toHaveBeenCalled();
    });
  });
  
  it('saves form data to store on valid submission', async () => {
    // Test implementation
  });
});
```

#### Backend API Test
```typescript
// tests/api/form-submit.test.ts
import { POST } from '@/app/api/form/submit/route';
import { createMockRequest } from '../helpers';

describe('POST /api/form/submit', () => {
  it('rejects unauthenticated requests', async () => {
    const request = createMockRequest({
      body: { /* form data */ },
      session: null,
    });
    
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
  
  it('validates form data with Zod schema', async () => {
    // Test implementation
  });
  
  it('creates travel request in database', async () => {
    // Test implementation
  });
});
```

#### E2E Test
```typescript
// e2e/form-submission.spec.ts
import { test, expect } from '@playwright/test';

test('complete form submission flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Navigate through form
  await expect(page).toHaveURL('/form/1');
  
  // Fill Page 1
  await page.fill('[name="passengerName"]', 'João Silva');
  await page.fill('[name="passengerEmail"]', 'joao@example.com');
  // ... more fields
  
  await page.click('text=Próximo');
  
  // Continue through pages...
  
  // Submit
  await page.click('text=Enviar Solicitação');
  
  // Verify confirmation
  await expect(page).toHaveURL(/\/confirmation/);
  await expect(page.locator('text=REQ-2025-')).toBeVisible();
});
```
