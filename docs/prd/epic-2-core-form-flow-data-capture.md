# Epic 2: Core Form Flow & Data Capture

**Goal:** Implement the complete 8-page travel request form with all required fields, conditional navigation logic based on user selections, and client-side state management using Zustand. This epic delivers the core business functionality allowing users to input and navigate through all travel request information.

### Story 2.1: Form Layout and Navigation Framework
As a user,  
I want to navigate through a multi-step form with clear progress indication,  
so that I understand where I am in the submission process.

**Acceptance Criteria:**
1. Form layout component with fixed background image applied to all pages
2. Progress indicator showing current page (1 of 8) with step names in Portuguese
3. Navigation buttons "Anterior" (Previous) and "Próximo" (Next) styled with shadcn/ui
4. Zustand store created with form state structure for all fields
5. Navigation logic preventing forward movement without required fields
6. Browser back/forward button support maintaining form state
7. Breadcrumb navigation allowing jump to previously completed pages

### Story 2.2: Passenger Data Page (Page 1)
As a user,  
I want to enter my personal and project information,  
so that my travel request is associated with correct passenger details.

**Acceptance Criteria:**
1. Form fields for: Projeto Vinculado (dropdown), Nome do Passageiro, E-mail do passageiro
2. Fields for: RG, Órgão Expedidor, CPF (with mask: 000.000.000-00)
3. Fields for: Data de Nascimento (date picker), Telefone (with mask)
4. Dados Bancários text area for bank account information
5. Tipo de Solicitação radio buttons (Passagens e Diárias, Apenas Passagens, Apenas Diárias)
6. All required fields marked with asterisk and validated
7. Form data persisted to Zustand store on navigation
8. Portuguese validation messages for invalid inputs

### Story 2.3: Travel Details and Basic Pages (Pages 2-4)
As a user,  
I want to specify my travel details and preferences,  
so that appropriate arrangements can be made.

**Acceptance Criteria:**
1. Page 2 - Origem/Destino fields with city autocomplete suggestions
2. Page 2 - Data ida/volta with date pickers preventing past dates
3. Page 2 - Tipo de Transporte radio options (Aéreo, Rodoviário, Ambos, Carro Próprio)
4. Page 3 - Tipo de Despesa checkboxes for expense categories
5. Page 4 - Preferências including baggage and transport allowance options
6. Page 4 - Estimated daily allowances number input
7. Conditional navigation logic based on selections
8. All form data synchronized with Zustand store

### Story 2.4: Conditional Pages Implementation (Pages 5-7)
As a user,  
I want to provide additional information when applicable,  
so that special requirements are captured.

**Acceptance Criteria:**
1. Page 5 (International) - Shows only if destination is international
2. Page 5 - Passport number and validity date fields
3. Page 5 - Passport image upload with preview (stores file reference)
4. Page 6 (Time Restriction) - Shows only if user indicates time constraints
5. Page 6 - Text area for describing flight time restrictions
6. Page 7 (Flight Preferences) - Shows only if user wants to suggest flights
7. Page 7 - File upload for flight suggestions document
8. Conditional logic correctly routes users based on their selections

### Story 2.5: Trip Objective and Review (Page 8)
As a user,  
I want to provide trip justification and review my information,  
so that I can ensure all details are correct before submission.

**Acceptance Criteria:**
1. Trip objective text area with minimum 50 character validation
2. Observations optional text area for additional notes
3. Urgent request justification field (required if marked urgent)
4. Summary section showing key form data from previous pages
5. Edit links allowing return to specific pages for corrections
6. All data retrieved from Zustand store for display
7. Visual indication of which fields are editable vs read-only
8. "Enviar Solicitação" (Submit Request) button prominently displayed
