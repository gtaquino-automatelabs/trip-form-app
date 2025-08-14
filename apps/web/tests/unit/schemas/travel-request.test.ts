import { describe, it, expect } from 'vitest';
import {
  travelRequestSchema,
  validateFormDataForSubmission,
  validateFormPage,
  personalInfoValidationSchema,
  travelDetailsValidationSchema,
  expenseTypesValidationSchema,
  preferencesValidationSchema,
  internationalTravelValidationSchema,
  timeRestrictionsValidationSchema,
  flightPreferencesValidationSchema,
  tripObjectiveValidationSchema
} from '@/schemas/travel-request';

describe('Travel Request Schema Validation', () => {
  describe('personalInfoValidationSchema', () => {
    it('should validate valid personal information', () => {
      const validData = {
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const
      };

      const result = personalInfoValidationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'invalid-email',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const
      };

      const result = personalInfoValidationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('E-mail inválido');
      }
    });

    it('should reject invalid CPF format', () => {
      const invalidData = {
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '12345678900', // Missing dots and dash
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const
      };

      const result = personalInfoValidationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('CPF inválido');
      }
    });

    it('should reject invalid phone format', () => {
      const invalidData = {
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '11987654321', // Missing parentheses and dash
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const
      };

      const result = personalInfoValidationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Formato inválido. Use: (99) 99999-9999');
      }
    });
  });

  describe('travelDetailsValidationSchema', () => {
    it('should validate valid travel details', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const validData = {
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: tomorrow,
        returnDate: dayAfterTomorrow,
        transportType: 'air' as const
      };

      const result = travelDetailsValidationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject past departure date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const invalidData = {
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: yesterday,
        returnDate: tomorrow,
        transportType: 'air' as const
      };

      const result = travelDetailsValidationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('A data deve ser futura');
      }
    });
  });

  describe('Complete Travel Request Validation', () => {
    it('should validate complete valid form data', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const validData = {
        // Personal info
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const,
        
        // Travel details
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: tomorrow,
        returnDate: dayAfterTomorrow,
        transportType: 'air' as const,
        
        // Expense types
        expenseTypes: ['accommodation', 'meals'],
        
        // Preferences
        baggageAllowance: true,
        transportAllowance: false,
        estimatedDailyAllowance: 250,
        
        // International travel
        isInternational: false,
        
        // Time restrictions
        hasTimeRestrictions: false,
        
        // Flight preferences
        hasFlightPreferences: false,
        
        // Trip objective
        tripObjective: 'Participar de reunião com cliente para apresentação do projeto',
        isUrgent: false
      };

      const result = travelRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should enforce return date after departure date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invalidData = {
        // Personal info
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const,
        
        // Travel details
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: tomorrow,
        returnDate: yesterday, // Invalid: before departure
        transportType: 'air' as const,
        
        // Other required fields
        expenseTypes: ['accommodation'],
        baggageAllowance: true,
        transportAllowance: false,
        estimatedDailyAllowance: 250,
        isInternational: false,
        hasTimeRestrictions: false,
        hasFlightPreferences: false,
        tripObjective: 'Business meeting',
        isUrgent: false
      };

      const result = travelRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const returnDateError = result.error.issues.find((e: any) => e.path.includes('returnDate'));
        expect(returnDateError?.message).toBe('Data de retorno deve ser após a data de partida');
      }
    });

    it('should require passport data for international travel', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const invalidData = {
        // Personal info
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const,
        
        // Travel details
        origin: 'São Paulo',
        destination: 'Buenos Aires',
        departureDate: tomorrow,
        returnDate: dayAfterTomorrow,
        transportType: 'air' as const,
        
        // Other required fields
        expenseTypes: ['accommodation'],
        baggageAllowance: true,
        transportAllowance: false,
        estimatedDailyAllowance: 250,
        isInternational: true, // International but no passport data
        hasTimeRestrictions: false,
        hasFlightPreferences: false,
        tripObjective: 'International conference',
        isUrgent: false
      };

      const result = travelRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passportError = result.error.issues.find((e: any) => e.path.includes('passportNumber'));
        expect(passportError?.message).toBe('Dados do passaporte são obrigatórios para viagens internacionais');
      }
    });

    it('should require urgent justification when marked as urgent', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const invalidData = {
        // Personal info
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil, Ag 1234, CC 56789-0',
        requestType: 'passages_per_diem' as const,
        
        // Travel details
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: tomorrow,
        returnDate: dayAfterTomorrow,
        transportType: 'air' as const,
        
        // Other required fields
        expenseTypes: ['accommodation'],
        baggageAllowance: true,
        transportAllowance: false,
        estimatedDailyAllowance: 250,
        isInternational: false,
        hasTimeRestrictions: false,
        hasFlightPreferences: false,
        tripObjective: 'Urgent meeting',
        isUrgent: true, // Urgent but no justification
        urgentJustification: '' // Empty justification
      };

      const result = travelRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const urgentError = result.error.issues.find((e: any) => e.path.includes('urgentJustification'));
        expect(urgentError?.message).toBe('Justificativa de urgência é obrigatória');
      }
    });
  });

  describe('validateFormDataForSubmission', () => {
    it('should return success with valid data', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const validData = {
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil',
        requestType: 'passages_per_diem',
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: tomorrow,
        returnDate: dayAfterTomorrow,
        transportType: 'air',
        expenseTypes: ['accommodation'],
        baggageAllowance: true,
        transportAllowance: false,
        estimatedDailyAllowance: 250,
        isInternational: false,
        hasTimeRestrictions: false,
        hasFlightPreferences: false,
        tripObjective: 'Business meeting with important client',
        isUrgent: false
      };

      const result = validateFormDataForSubmission(validData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return errors with invalid data', () => {
      const invalidData = {
        projectName: 'AB', // Too short
        passengerEmail: 'invalid-email',
        // Missing required fields
      };

      const result = validateFormDataForSubmission(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateFormPage', () => {
    it('should validate page 1 (personal info)', () => {
      const validData = {
        projectName: 'Project Alpha',
        passengerName: 'João Silva',
        passengerEmail: 'joao@example.com',
        rg: '123456789',
        rgIssuer: 'SSP-SP',
        cpf: '123.456.789-00',
        birthDate: new Date('1990-01-01'),
        phone: '(11) 98765-4321',
        bankDetails: 'Banco do Brasil',
        requestType: 'passages_per_diem'
      };

      const result = validateFormPage(1, validData);
      expect(result.success).toBe(true);
    });

    it('should validate page 2 (travel details)', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const validData = {
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: tomorrow,
        returnDate: dayAfterTomorrow,
        transportType: 'air'
      };

      const result = validateFormPage(2, validData);
      expect(result.success).toBe(true);
    });

    it('should return error for invalid page number', () => {
      const result = validateFormPage(99, {});
      expect(result.success).toBe(false);
      expect(result.errors?.general).toContain('Erro na validação');
    });
  });
});