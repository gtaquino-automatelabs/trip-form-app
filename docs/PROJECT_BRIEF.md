# PROJECT BRIEF: Travel Request Form System

## Executive Summary

Transform the current Microsoft Forms-based travel request system into a custom web application that maintains familiar user experience while adding database persistence and administrative capabilities.

---

## 1. PROJECT OVERVIEW

**Problem Statement:**  
CEIA (Centro de Excelência em Inteligência Artificial) currently uses Microsoft Forms for travel and per diem requests with limitations in dynamic fields, data persistence, and lack of integrated flight search capabilities.

**Solution:**  
Custom web application replicating exact form functionality with database storage and admin dashboard.

**MVP Scope:** Simple Clone+ (Option A)
- Exact form replication
- PostgreSQL database storage  
- Basic admin view
- File upload capability

**Project Language:** Portuguese (UI), English (code/documentation)

---

## 2. TECHNICAL SPECIFICATIONS

### Tech Stack
- **Frontend:** Next.js 15.3, React 19, TailwindCSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **State Management:** Zustand
- **Validation:** Zod
- **Infrastructure:** Turborepo monorepo
- **Package Manager:** npm 11.4.2

### Architecture Pattern
- Multi-page routing mimicking original form flow
- Server-side form submission
- Direct file upload to local storage (MVP)
- Gradient background with wave patterns (existing design)

---

## 3. FUNCTIONAL REQUIREMENTS

### Core Features
1. 8-page form with conditional branching
2. All 30+ fields from original form
3. Portuguese language interface
4. File uploads (passport images, flight suggestions)
5. Form submission to database
6. Admin dashboard for viewing submissions
7. Maintain exact visual design from Microsoft Forms

### Form Pages & Flow

```
Page 1: Dados do Passageiro (Passenger Data)
  ├─→ Page 5: Viagem Internacional (if international)
  └─→ Page 2: Dados da Passagem (Travel Details)
      ├─→ Page 6: Restrição de Voo (if time restriction)
      └─→ Page 3: Tipo de Despesa (Expense Type)
          └─→ Page 4: Preferências e Diárias (Preferences)
              ├─→ Page 7: Sugestões de Voos (if flight preference)
              └─→ Page 8: Objetivo da Viagem (Trip Objective)
                  └─→ Confirmation Page
```

### Required Fields

**Page 1 - Passenger Data:**
- Projeto Vinculado (Project) *
- Nome do Passageiro (Passenger Name) *
- E-mail do passageiro (Passenger Email) *
- RG + Órgão Expedidor (ID + Issuer) *
- CPF *
- Data de Nascimento (Birth Date)
- Telefone de contato (Phone)
- Dados Bancários (Bank Details) *
- Tipo de Solicitação (Request Type)

**Page 2 - Travel Details:**
- Origem (Origin) *
- Destino (Destination) *
- Data da ida (Departure Date) *
- Data da volta (Return Date) *
- Datas da missão/evento (Mission Dates)
- Tipo de Transporte (Transport Type) *
- Tipo de Despesa (Expense Type)

**Additional Conditional Pages:**
- International travel details
- Time restrictions
- Flight preferences
- Trip justification

---

## 4. DATA MODEL

### Database Schema (Prisma)

```prisma
model TravelRequest {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  
  // Passenger Data
  projectName       String
  coordinatorEmail  String?
  passengerName     String
  passengerEmail    String
  rg                String
  rgEmissor         String
  cpf               String
  birthDate         DateTime?
  phone             String?
  bankDetails       String
  requestType       RequestType
  
  // Travel Data
  isInternational   Boolean
  passportNumber    String?
  passportImage     String?
  origin            String
  destination       String
  departureDate     DateTime
  returnDate        DateTime
  missionDates      String?
  transportType     TransportType
  expenseType       String?
  
  // Preferences
  hasTimeRestriction Boolean
  timeRestrictionDetails String?
  hasFlightPreference Boolean
  flightSuggestionFile String?
  includeBaggage    Boolean
  includeTransportAllowance Boolean
  estimatedDailyAllowances Int?
  
  // Justification
  tripObjective     String
  observations      String?
  urgentJustification String
  
  // Admin tracking
  status            RequestStatus @default(SUBMITTED)
}

enum RequestType {
  PASSAGENS_E_DIARIAS
  APENAS_PASSAGENS
  APENAS_DIARIAS
}

enum TransportType {
  AEREO
  RODOVIARIO
  AMBOS
  CARRO_PROPRIO
}

enum RequestStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  COMPLETED
}
```

---

## 5. IMPLEMENTATION ROADMAP

### Week 1: Foundation (Days 1-5)
- [ ] Project setup with Turborepo structure
- [ ] Database schema implementation with Prisma
- [ ] Create route structure for all 8 pages
- [ ] Implement layout with gradient background design
- [ ] Setup Zustand store for form state

### Week 2: Form Development (Days 6-10)
- [ ] Implement all 8 form pages with fields
- [ ] Add conditional navigation logic
- [ ] Implement Zod validation schemas
- [ ] Create file upload API endpoint
- [ ] Build form navigation components

### Week 3: Integration & Polish (Days 11-15)
- [ ] Create form submission endpoint
- [ ] Build admin dashboard with table view
- [ ] Add error handling and loading states
- [ ] Testing & bug fixes
- [ ] Deployment preparation

---

## 6. FILE STRUCTURE

```
trip-form-app/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── form/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── passenger-data/
│   │   │   │   ├── international/
│   │   │   │   ├── travel-details/
│   │   │   │   ├── time-restriction/
│   │   │   │   ├── expense-type/
│   │   │   │   ├── flight-preference/
│   │   │   │   ├── allowances/
│   │   │   │   ├── trip-objective/
│   │   │   │   └── confirmation/
│   │   │   ├── admin/
│   │   │   └── api/
│   │   │       ├── upload/
│   │   │       └── submit-form/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   │       └── uploads/
│   └── server/
│       └── prisma/
│           └── schema/
```

---

## 7. SUCCESS CRITERIA

### MVP Completion Checklist
- [ ] User can complete entire form flow
- [ ] All conditional logic works correctly
- [ ] Data persists to PostgreSQL database
- [ ] Files upload successfully
- [ ] Admin can view all submissions
- [ ] Maintains exact visual design
- [ ] Works on desktop browsers (Chrome, Firefox, Edge)
- [ ] Form validates all required fields
- [ ] Portuguese language throughout UI

### Performance Targets
- Page load time: < 2 seconds
- Form submission: < 3 seconds
- File upload: < 5 seconds for 10MB file
- 100% form completion success rate

---

## 8. FUTURE ENHANCEMENTS (Post-MVP)

### Phase 2: Dynamic Data
- Dynamic project dropdown from database
- Auto-complete for returning passengers
- Email notifications on submission
- Advanced validation rules

### Phase 3: Smart Features
- Integrated flight search API
- Approval workflow system
- Advanced reporting dashboard
- Export to Excel functionality
- Mobile responsive design

### Phase 4: Advanced Integration
- Integration with financial systems
- Automatic per diem calculation
- Policy compliance checking
- Historical data analytics

---

## 9. RISK MITIGATION

| Risk | Impact | Mitigation Strategy |
|------|--------|-------------------|
| Scope creep | High | Strict MVP definition, feature freeze until launch |
| Data migration | Low | Not required for MVP, manual entry acceptable |
| User adoption | Medium | Identical UI to current system, training materials |
| Technical complexity | Low | Proven tech stack, simple architecture |
| File storage limits | Low | Monitor usage, plan cloud migration for Phase 2 |
| Browser compatibility | Low | Test on major browsers, provide fallbacks |

---

## 10. TECHNICAL DECISIONS LOG

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page Structure | Multi-page routes | Better mimics Microsoft Forms UX |
| State Management | Zustand | Simpler than Context API for multi-step forms |
| File Storage | Local filesystem | Simplest for MVP, easy to migrate later |
| Validation | Zod | Type-safe, works well with TypeScript |
| UI Components | shadcn/ui | Consistent design, easy customization |
| MVP Scope | Simple Clone+ | Fastest time to market, proves concept |

---

## 11. IMMEDIATE NEXT ACTIONS

1. **Initialize project** with Turborepo and dependencies
2. **Setup Prisma** and create database schema
3. **Create layout component** with gradient background
4. **Build first form page** (passenger-data) as proof of concept
5. **Implement navigation logic** between pages
6. **Setup file upload endpoint**
7. **Create form submission handler**

---

## 12. CONTACTS & RESOURCES

**Current Form URL:**  
`https://forms.office.com/Pages/ResponsePage.aspx?id=...`

**Design Assets:**
- Gradient colors: Cyan (#00D4FF) to Purple (#7B2FF7)
- Font: System default (Inter or similar)
- Logo: CEIA brain graphic

**Technical Resources:**
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

---

## 13. ACCEPTANCE CRITERIA

The MVP will be considered complete when:

1. **Functional Requirements Met**
   - All 8 form pages implemented
   - Conditional logic functioning
   - Data saves to database
   - Files upload successfully
   - Admin can view submissions

2. **Quality Standards Met**
   - No critical bugs
   - All required fields validate
   - Error messages in Portuguese
   - Loading states implemented

3. **User Experience Maintained**
   - Identical look to current form
   - Same flow and navigation
   - Clear error messages
   - Successful submission confirmation

---

## APPENDIX A: Form Field Mapping

[Detailed field-by-field mapping between Microsoft Forms and database schema - to be completed during implementation]

---

## APPENDIX B: API Endpoints

### MVP Endpoints
- `POST /api/upload` - File upload
- `POST /api/submit-form` - Form submission
- `GET /api/admin/requests` - List all requests
- `GET /api/admin/requests/[id]` - Get single request

---

**Document Version:** 1.0  
**Created:** 2025-08-11  
**Author:** Mary (Business Analyst)  
**Status:** APPROVED FOR DEVELOPMENT

---

*This brief serves as the single source of truth for MVP development. All features not explicitly mentioned are OUT OF SCOPE for initial release.*