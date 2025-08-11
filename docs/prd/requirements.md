# Requirements

### Functional Requirements

- **FR1:** System shall replicate all 8 pages from the original Microsoft Forms with exact field structure and conditional navigation logic
- **FR2:** System shall persist all form submissions to PostgreSQL database with complete field data capture
- **FR3:** System shall support file uploads for passport images and flight suggestion documents with max 10MB per file
- **FR4:** System shall implement conditional page routing based on user selections (international travel, time restrictions, flight preferences)
- **FR5:** System shall provide real-time field validation with Portuguese error messages for all required fields
- **FR6:** System shall generate unique request IDs using CUID for each submission
- **FR7:** Admin dashboard shall display all submissions in a searchable, sortable table view
- **FR8:** System shall maintain form state across pages using Zustand state management
- **FR9:** System shall display confirmation page with submitted data summary after successful submission
- **FR10:** System shall support three request types: "Passagens e Diárias", "Apenas Passagens", "Apenas Diárias"
- **FR11:** System shall require user authentication via email/password or OAuth providers (Google, Microsoft) before form access
- **FR12:** System shall maintain user sessions and associate form submissions with authenticated users
- **FR13:** Login page shall support both sign-in and sign-up flows with password recovery option

### Non-Functional Requirements

- **NFR1:** Page load time must be under 2 seconds on standard broadband connection
- **NFR2:** Form submission processing must complete within 3 seconds
- **NFR3:** File uploads must support up to 10MB files and complete within 5 seconds
- **NFR4:** System must maintain 100% form completion success rate without data loss
- **NFR5:** Application must work on Chrome, Firefox, and Edge browsers (latest versions)
- **NFR6:** All UI text and error messages must be in Portuguese language
- **NFR7:** System must maintain visual consistency with original Microsoft Forms design (using provided background image)
- **NFR8:** Database must support concurrent form submissions without conflicts
- **NFR9:** System must handle browser back/forward navigation without data loss
- **NFR10:** Application must be deployable to standard Node.js hosting environments
- **NFR11:** Authentication tokens must be securely stored and validated
- **NFR12:** OAuth integration must follow provider security best practices
