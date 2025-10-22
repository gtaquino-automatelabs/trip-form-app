import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TravelRequestInput {
  // Passenger Data (Page 1)
  projectName: string;
  passengerName: string;
  passengerEmail: string;
  rg: string;
  rgIssuer: string;
  cpf: string;
  birthDate: Date | string;
  phone: string;
  bankDetails: string;
  // Structured bank fields
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  requestType: 'passages_per_diem' | 'passages_only' | 'per_diem_only';
  
  // Travel Details (Page 2)
  origin: string;
  destination: string;
  departureDate: Date | string;
  returnDate: Date | string;
  transportType: 'air' | 'road' | 'both' | 'own_car' | '';
  
  // Expense Types (Page 3)
  expenseTypes: string[];
  otherExpenseDescription?: string;
  
  // Preferences (Page 4)
  baggageAllowance: boolean;
  transportAllowance: boolean;
  estimatedDailyAllowance: number;
  
  // International Travel (Page 5 - conditional)
  isInternational: boolean;
  passportNumber?: string;
  passportValidity?: Date | string;
  passportImageUrl?: string;
  visaRequired?: boolean;
  
  // Time Restrictions (Page 6 - conditional)
  hasTimeRestrictions: boolean;
  timeRestrictionDetails?: string;
  
  // Flight Preferences (Page 7 - conditional)
  hasFlightPreferences: boolean;
  flightSuggestionUrls?: string[];
  flightSuggestionFiles?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }>;
  flightPreferences?: string;
  
  // Trip Objective (Page 8)
  tripObjective: string;
  observations?: string;
  isUrgent: boolean;
  urgentJustification?: string;
}

interface FormState {
  // Form data
  formData: Partial<TravelRequestInput>;
  
  // Navigation state
  currentPage: number;
  visitedPages: number[];
  
  // Submission state
  isSubmitting: boolean;
  submissionProgress: number; // 0-100
  submissionError: string | null;
  lastSubmissionId: string | null;
  submissionToken: string | null;
  
  // Recovery state
  hasRecoverableData: boolean;
  lastAutoSave: number | null;
  
  // File upload state
  uploadedFiles: {
    passport?: {
      fileName: string;
      fileUrl: string;
      fileSize: number;
      fileType: string;
    };
    flights: Array<{
      fileName: string;
      fileUrl: string;
      fileSize: number;
      fileType: string;
    }>;
  };
  
  // Actions
  updateFormData: (data: Partial<TravelRequestInput>) => void;
  setCurrentPage: (page: number) => void;
  markPageVisited: (page: number) => void;
  clearFormData: () => void;
  resetNavigation: () => void;
  
  // Submission actions
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmissionProgress: (progress: number) => void;
  setSubmissionError: (error: string | null) => void;
  setLastSubmissionId: (id: string | null) => void;
  resetSubmissionState: () => void;
  generateSubmissionToken: () => void;
  getSubmissionToken: () => string;
  
  // File actions
  addUploadedFile: (type: 'passport' | 'flight', file: any) => void;
  removeUploadedFile: (type: 'passport' | 'flight', fileUrl: string) => void;
  clearUploadedFiles: () => void;
  
  // Utilities
  canNavigateToPage: (page: number) => boolean;
  getNextAvailablePage: () => number;
  getPreviousAvailablePage: () => number;
  isInternationalDestination: (destination: string) => boolean;
  
  // Recovery actions
  setHasRecoverableData: (hasData: boolean) => void;
  setLastAutoSave: (timestamp: number | null) => void;
  recoverFormData: () => void;
}

const INTERNATIONAL_INDICATORS = [
  'Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Colombia',
  'Peru', 'Bolivia', 'Venezuela', 'Estados Unidos', 'EUA', 'USA',
  'Portugal', 'Espanha', 'França', 'Inglaterra', 'Alemanha',
  'Itália', 'Reino Unido', 'França', 'Suíça', 'Holanda',
  'Bélgica', 'Áustria', 'Suécia', 'Noruega', 'Dinamarca',
  'Finlândia', 'Canadá', 'México', 'Japão', 'China', 'Coreia',
  'Austrália', 'Nova Zelândia', 'África do Sul', 'Egito',
  'Marrocos', 'Turquia', 'Rússia', 'Índia', 'Tailândia',
  'Singapura', 'Emirados Árabes', 'Israel', 'Líbano', 'Jordânia'
];

const initialFormData: Partial<TravelRequestInput> = {
  requestType: 'passages_per_diem',
  transportType: '',
  expenseTypes: [],
  baggageAllowance: false,
  transportAllowance: false,
  estimatedDailyAllowance: 0,
  isInternational: false,
  hasTimeRestrictions: false,
  hasFlightPreferences: false,
  isUrgent: false,
  flightSuggestionUrls: [],
  flightSuggestionFiles: [],
  // Initialize bank fields
  bankDetails: '',
  bankName: '',
  bankBranch: '',
  bankAccount: ''
};

const generateUniqueToken = () => {
  return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      // Initial state
      formData: initialFormData,
      currentPage: 1,
      visitedPages: [1],
      isSubmitting: false,
      submissionProgress: 0,
      submissionError: null,
      lastSubmissionId: null,
      submissionToken: null,
      hasRecoverableData: false,
      lastAutoSave: null,
      uploadedFiles: {
        flights: []
      },

      // Actions
      updateFormData: (data) =>
        set((state) => {
          const updatedFormData = { ...state.formData, ...data };
          
          // Auto-detect international destination if destination is being updated
          if (data.destination !== undefined) {
            const isInternational = get().isInternationalDestination(data.destination);
            updatedFormData.isInternational = isInternational;
          }
          
          // Auto-combine bank fields into bankDetails for database storage
          if (data.bankName !== undefined || data.bankBranch !== undefined || data.bankAccount !== undefined) {
            const bankName = data.bankName ?? state.formData.bankName ?? '';
            const bankBranch = data.bankBranch ?? state.formData.bankBranch ?? '';
            const bankAccount = data.bankAccount ?? state.formData.bankAccount ?? '';
            
            if (bankName || bankBranch || bankAccount) {
              updatedFormData.bankDetails = `Banco: ${bankName}${bankBranch ? `\nAgência: ${bankBranch}` : ''}${bankAccount ? `\nConta: ${bankAccount}` : ''}`.trim();
            }
          }
          
          return {
            formData: updatedFormData
          };
        }),

      setCurrentPage: (page) =>
        set((state) => {
          console.log(`🏪 STORE: setCurrentPage called - from ${state.currentPage} to ${page}`);
          
          // Only update current page, don't automatically mark intermediate pages as visited
          // This respects conditional page logic
          const newState = {
            ...state,
            currentPage: page
          };
          
          console.log('🏪 STORE: New state will be:', newState);
          return newState;
        }),

      markPageVisited: (page) =>
        set((state) => {
          console.log(`Store markPageVisited: ${page}`);
          console.log('Current visitedPages:', state.visitedPages);
          
          if (state.visitedPages.includes(page)) {
            console.log('Page already visited, no change');
            return state;
          }
          
          const newVisitedPages = [...state.visitedPages, page].sort((a, b) => a - b);
          console.log('New visitedPages:', newVisitedPages);
          
          return {
            visitedPages: newVisitedPages
          };
        }),

      clearFormData: () =>
        set({
          formData: initialFormData,
          currentPage: 1,
          visitedPages: [1]
        }),

      resetNavigation: () =>
        set({
          currentPage: 1,
          visitedPages: [1]
        }),
      
      // Submission actions
      setSubmitting: (isSubmitting) =>
        set({ isSubmitting }),
      
      setSubmissionProgress: (progress) =>
        set({ submissionProgress: progress }),
      
      setSubmissionError: (error) =>
        set({ submissionError: error }),
      
      setLastSubmissionId: (id) =>
        set({ lastSubmissionId: id }),
      
      resetSubmissionState: () =>
        set({
          isSubmitting: false,
          submissionProgress: 0,
          submissionError: null,
          submissionToken: null
        }),
      
      generateSubmissionToken: () =>
        set({ submissionToken: generateUniqueToken() }),
      
      getSubmissionToken: () => {
        const state = get();
        if (!state.submissionToken) {
          const token = generateUniqueToken();
          set({ submissionToken: token });
          return token;
        }
        return state.submissionToken;
      },
      
      // File actions
      addUploadedFile: (type, file) =>
        set((state) => {
          if (type === 'passport') {
            return {
              uploadedFiles: {
                ...state.uploadedFiles,
                passport: file
              }
            };
          } else {
            return {
              uploadedFiles: {
                ...state.uploadedFiles,
                flights: [...state.uploadedFiles.flights, file]
              }
            };
          }
        }),
      
      removeUploadedFile: (type, fileUrl) =>
        set((state) => {
          if (type === 'passport') {
            return {
              uploadedFiles: {
                ...state.uploadedFiles,
                passport: undefined
              }
            };
          } else {
            return {
              uploadedFiles: {
                ...state.uploadedFiles,
                flights: state.uploadedFiles.flights.filter(f => f.fileUrl !== fileUrl)
              }
            };
          }
        }),
      
      clearUploadedFiles: () =>
        set((state) => ({
          uploadedFiles: {
            passport: undefined,
            flights: []
          }
        })),

      // Utilities
      canNavigateToPage: (page) => {
        const state = get();
        const { formData, visitedPages } = state;

        // Can always navigate to visited pages
        if (visitedPages.includes(page)) {
          return true;
        }

        // Check conditional page visibility
        // Page 5 (International) - only if destination is international
        if (page === 5 && !formData.isInternational) {
          return false;
        }

        // Page 6 (Time Restrictions) - only if hasTimeRestrictions is true
        if (page === 6 && !formData.hasTimeRestrictions) {
          return false;
        }

        // Page 7 (Flight Preferences) - only if hasFlightPreferences is true
        if (page === 7 && !formData.hasFlightPreferences) {
          return false;
        }

        // Can navigate to the next unvisited page if current page is complete
        const maxVisited = Math.max(...visitedPages);
        return page === maxVisited + 1;
      },

      getNextAvailablePage: () => {
        const state = get();
        const { currentPage, formData } = state;

        let nextPage = currentPage + 1;

        // Keep incrementing to skip conditional pages if conditions not met
        while (nextPage <= 8) {
          // Page 5 is only available if international
          if (nextPage === 5 && !formData.isInternational) {
            console.log('Skipping page 5 - not international');
            nextPage++;
            continue;
          }
          // Page 6 is only available if hasTimeRestrictions is true
          if (nextPage === 6 && !formData.hasTimeRestrictions) {
            console.log('Skipping page 6 - no time restrictions');
            nextPage++;
            continue;
          }
          // Page 7 is only available if hasFlightPreferences is true
          if (nextPage === 7 && !formData.hasFlightPreferences) {
            console.log('Skipping page 7 - no flight preferences');
            nextPage++;
            continue;
          }
          // Found a valid page
          console.log(`Next available page: ${nextPage}`);
          break;
        }

        return Math.min(nextPage, 8);
      },

      getPreviousAvailablePage: () => {
        const state = get();
        const { currentPage, formData } = state;

        let prevPage = currentPage - 1;

        // Keep decrementing to skip conditional pages if conditions not met
        while (prevPage >= 1) {
          // Page 5 is only available if international
          if (prevPage === 5 && !formData.isInternational) {
            prevPage--;
            continue;
          }
          // Page 6 is only available if hasTimeRestrictions is true
          if (prevPage === 6 && !formData.hasTimeRestrictions) {
            prevPage--;
            continue;
          }
          // Page 7 is only available if hasFlightPreferences is true
          if (prevPage === 7 && !formData.hasFlightPreferences) {
            prevPage--;
            continue;
          }
          // Found a valid page
          break;
        }

        return Math.max(prevPage, 1);
      },
      
      isInternationalDestination: (destination: string) => {
        if (!destination) return false;
        return INTERNATIONAL_INDICATORS.some(country => 
          destination.toLowerCase().includes(country.toLowerCase())
        );
      },
      
      // Recovery actions
      setHasRecoverableData: (hasData) =>
        set({ hasRecoverableData: hasData }),
      
      setLastAutoSave: (timestamp) =>
        set({ lastAutoSave: timestamp }),
      
      recoverFormData: () => {
        const savedData = localStorage.getItem('travelForm_autoSave');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            set({
              formData: parsed.formData || initialFormData,
              currentPage: parsed.currentPage || 1,
              visitedPages: parsed.visitedPages || [1],
              uploadedFiles: parsed.uploadedFiles || { flights: [] },
              hasRecoverableData: false,
              lastAutoSave: parsed.timestamp || null
            });
            // Clear the auto-save after recovery
            localStorage.removeItem('travelForm_autoSave');
          } catch (error) {
            console.error('Error recovering form data:', error);
          }
        }
      }
    }),
    {
      name: 'travel-form-storage',
      version: 1, // Added version to force migration
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        formData: state.formData,
        currentPage: state.currentPage,
        visitedPages: state.visitedPages,
        uploadedFiles: state.uploadedFiles,
        submissionToken: state.submissionToken,
        lastAutoSave: state.lastAutoSave
      }),
      migrate: (persistedState: any, version: number) => {
        // If coming from version 0 (no version), reset the state to fix requestType issues
        if (version === 0) {
          return {
            formData: initialFormData,
            currentPage: 1,
            visitedPages: [1]
          };
        }
        return persistedState;
      }
    }
  )
);