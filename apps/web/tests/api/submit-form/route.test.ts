import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '@/app/api/submit-form/route';

// Mock the dependencies
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'REQ-2025-TEST1234' },
            error: null
          }))
        }))
      }))
    }))
  })),
  requireAuth: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id' }
  }))
}));

vi.mock('@paralleldrive/cuid2', () => ({
  createId: vi.fn(() => 'TEST1234')
}));

describe('POST /api/submit-form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createValidFormData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    return {
      projectName: 'Test Project',
      passengerName: 'João Silva',
      passengerEmail: 'joao@example.com',
      rg: '123456789',
      rgIssuer: 'SSP-SP',
      cpf: '123.456.789-00',
      birthDate: '1990-01-01',
      phone: '(11) 98765-4321',
      bankDetails: 'Banco do Brasil, Ag 1234',
      requestType: 'passages_per_diem',
      origin: 'São Paulo',
      destination: 'Rio de Janeiro',
      departureDate: tomorrow.toISOString(),
      returnDate: dayAfterTomorrow.toISOString(),
      transportType: 'air',
      expenseTypes: ['accommodation', 'meals'],
      baggageAllowance: true,
      transportAllowance: false,
      estimatedDailyAllowance: 250,
      isInternational: false,
      hasTimeRestrictions: false,
      hasFlightPreferences: false,
      tripObjective: 'Participar de reunião importante com cliente',
      isUrgent: false
    };
  };

  it('should successfully submit valid form data', async () => {
    const formData = createValidFormData();
    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.requestId).toMatch(/^REQ-\d{4}-[A-Z0-9]+$/);
    expect(result.data.message).toBe('Solicitação enviada com sucesso');
  });

  it('should reject request without authentication', async () => {
    const { requireAuth } = await import('@/lib/supabase-server');
    vi.mocked(requireAuth).mockRejectedValueOnce(new Error('Unauthorized'));

    const formData = createValidFormData();
    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('UNAUTHORIZED');
    expect(result.error.message).toBe('Usuário não autenticado');
  });

  it('should reject invalid form data', async () => {
    const invalidData = {
      projectName: 'Te', // Too short
      passengerEmail: 'invalid-email',
      // Missing required fields
    };

    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.message).toBe('Erro na validação dos dados');
    expect(result.error.details).toBeDefined();
  });

  it('should handle database errors gracefully', async () => {
    const { createSupabaseServerClient } = await import('@/lib/supabase-server');
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { code: '23505', message: 'Duplicate key' }
            }))
          }))
        }))
      }))
    } as any);

    const formData = createValidFormData();
    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('DUPLICATE_REQUEST');
  });

  it('should handle malformed JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'POST',
      body: 'invalid json {',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('INVALID_REQUEST');
    expect(result.error.message).toBe('Dados inválidos no corpo da requisição');
  });

  it('should validate conditional fields for international travel', async () => {
    const formData = createValidFormData();
    formData.isInternational = true;
    // Missing passport data

    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.details).toBeDefined();
  });

  it('should validate urgent justification when marked as urgent', async () => {
    const formData = createValidFormData();
    formData.isUrgent = true;
    // Missing urgent justification

    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('OPTIONS /api/submit-form', () => {
  it('should return correct CORS headers', async () => {
    const request = new NextRequest('http://localhost:3000/api/submit-form', {
      method: 'OPTIONS'
    });

    const response = await OPTIONS(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
  });
});