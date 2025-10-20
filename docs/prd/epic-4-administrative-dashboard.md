# Epic 4: Administrative Dashboard

**Goal:** Create a comprehensive administrative interface allowing authorized users to view, search, filter, and manage all submitted travel requests with status tracking capabilities. This epic delivers business value by enabling oversight and management of the travel request workflow.

### Story 4.1: Admin Authentication and Authorization
As an administrator,  
I want secure access to the admin dashboard,  
so that only authorized personnel can view travel requests.

**Acceptance Criteria:**
1. Admin role defined in Supabase auth.users metadata
2. Protected route /admin requiring authenticated admin user
3. Role-based access control checking user.role === 'admin'
4. Unauthorized access redirects to login with error message
5. Admin user indicator in UI header when logged in as admin
6. Separate admin login URL (/admin/login) if desired
7. Session validation on each admin page load
8. Audit log entry for admin access (user, timestamp)

### Story 4.2: Request List Table View
As an administrator,  
I want to see all travel requests in a table format,  
so that I can quickly review submissions.

**Acceptance Criteria:**
1. Data table component using shadcn/ui Table
2. Columns: Request ID, Passenger Name, Destination, Departure Date, Status, Submitted Date
3. Pagination with 25 records per page and page navigation
4. Sort functionality on all columns (ascending/descending)
5. Row highlighting on hover for better readability
6. Status badges with colors (Submitted=blue, Under Review=yellow, Approved=green, Rejected=red)
7. Click on row to view detailed request information
8. Loading skeleton while fetching data from Supabase

### Story 4.3: Search and Filter Capabilities
As an administrator,  
I want to search and filter travel requests,  
so that I can find specific submissions quickly.

**Acceptance Criteria:**
1. Global search box searching across passenger name, destination, and request ID
2. Date range filter for departure dates
3. Date range filter for submission dates
4. Status filter with multi-select checkboxes
5. Project filter dropdown populated from unique projects
6. Request type filter (Passagens e Diárias, Apenas Passagens, Apenas Diárias)
7. Clear filters button to reset all filters
8. Filter state persisted in URL parameters for sharing

### Story 4.4: Request Detail View and Actions
As an administrator,  
I want to view complete request details and take actions,  
so that I can process travel requests effectively.

**Acceptance Criteria:**
1. Modal or side panel showing all form fields from submission
2. Formatted display of passenger information section
3. Travel details with clear date formatting
4. File attachments viewable/downloadable (passport, flight suggestions)
5. Status change dropdown (Submitted, Under Review, Approved, Rejected, Completed)
6. Comments text area for adding internal notes
7. "Save Changes" button updating Supabase record
8. Activity history showing status changes and comments with timestamps

### Story 4.5: Export and Reporting Features
As an administrator,  
I want to export travel request data,  
so that I can create reports and share with stakeholders.

**Acceptance Criteria:**
1. Export to CSV button downloading filtered results
2. Export includes all form fields in structured format
3. Portuguese column headers in exported file
4. Date formatting suitable for Excel (DD/MM/YYYY)
5. Summary statistics card showing total requests by status
6. Monthly request volume chart (using simple chart library)
7. Print view for individual request details
8. Batch export option for selected requests
