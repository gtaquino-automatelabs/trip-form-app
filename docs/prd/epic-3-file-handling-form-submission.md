# Epic 3: File Handling & Form Submission

**Goal:** Implement file upload capabilities for passport images and flight documents, create the form submission pipeline to Supabase, and provide users with a confirmation experience. This epic completes the user journey from data entry to successful submission with proper validation and error handling.

### Story 3.1: File Upload Infrastructure
As a developer,  
I want to implement secure file upload handling,  
so that users can attach required documents to their requests.

**Acceptance Criteria:**
1. File upload API endpoint at /api/upload accepting multipart form data
2. File validation for type (images: jpg, png; documents: pdf, doc, docx)
3. File size validation (max 10MB per file)
4. Files stored in public/uploads/ with unique naming (timestamp + original name)
5. Supabase Storage bucket configured for file storage (alternative to local)
6. Upload progress indicator showing percentage complete
7. Error handling for failed uploads with Portuguese error messages
8. Cleanup mechanism for orphaned files (uploaded but not submitted)

### Story 3.2: File Upload UI Components
As a user,  
I want to upload passport images and flight suggestions easily,  
so that I can provide required documentation.

**Acceptance Criteria:**
1. Drag-and-drop file upload zone with visual feedback
2. Click to browse file selection alternative
3. File preview for images showing thumbnail
4. File name and size display for uploaded documents
5. Delete button to remove uploaded files before submission
6. Multiple file support for flight suggestions
7. Real-time validation feedback for invalid file types/sizes
8. Upload state persisted in Zustand store with file references

### Story 3.3: Form Validation and Submission
As a user,  
I want my form to be validated and submitted successfully,  
so that my travel request is processed.

**Acceptance Criteria:**
1. Comprehensive Zod schema validating all form fields
2. Pre-submission validation checking all required fields
3. API endpoint /api/submit-form receiving complete form data
4. Form data inserted into Supabase TravelRequest table
5. File references linked to travel request record
6. Unique request ID (CUID) generated and returned
7. Error handling for submission failures with retry option
8. Loading state during submission with spinner

### Story 3.4: Confirmation and Success Flow
As a user,  
I want to see confirmation that my request was submitted,  
so that I have a reference for tracking.

**Acceptance Criteria:**
1. Confirmation page displaying "Solicitação Enviada com Sucesso!"
2. Request reference number prominently displayed (e.g., REQ-2025-0001)
3. Summary of submitted information in read-only format
4. Timestamp of submission in Brazilian format
5. "Imprimir" (Print) button for generating PDF summary
6. "Nova Solicitação" button to start new request
7. Email confirmation sent to user (if email service configured)
8. Zustand store cleared after successful submission

### Story 3.5: Error Recovery and Edge Cases
As a developer,  
I want to handle submission errors gracefully,  
so that users don't lose their data.

**Acceptance Criteria:**
1. Network failure detection with offline message
2. Partial submission recovery using saved Zustand state
3. Duplicate submission prevention (idempotency check)
4. Session timeout handling with re-authentication flow
5. Server validation errors displayed with field-level messages
6. Automatic form data backup to localStorage every 30 seconds
7. "Recuperar Formulário" option if browser closed unexpectedly
8. Comprehensive error logging for debugging
