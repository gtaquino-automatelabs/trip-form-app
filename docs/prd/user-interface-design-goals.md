# User Interface Design Goals

### Overall UX Vision
Modern authentication-first experience leading into the familiar form interface. Users authenticate via email/password or SSO providers before accessing the travel request form, ensuring secure data capture and user tracking.

### Key Interaction Paradigms
- **Authentication gateway**: Login/signup page as entry point with multiple auth options
- **Progressive disclosure**: Multi-page flow reveals fields contextually based on user selections
- **Immediate validation**: Real-time field validation with inline Portuguese error messages
- **Visual continuity**: Fixed background image (background.png) throughout application
- **Breadcrumb navigation**: Clear indication of current position in form flow with ability to navigate backward

### Core Screens and Views
- **Login/Signup Page**: Email/password authentication with Google and Microsoft SSO options
- **Form Landing Page**: Post-authentication entry with project selection and start button
- **Page 1 - Passenger Data Screen**: Core passenger information collection
- **Page 2 - Travel Details Screen**: Origin, destination, and date selection
- **Page 3 - Expense Type Screen**: Selection of expense categories
- **Page 4 - Preferences Screen**: Per diem and allowance preferences
- **Page 5 - International Travel Screen**: Passport and visa information (conditional)
- **Page 6 - Time Restrictions Screen**: Flight time constraints (conditional)
- **Page 7 - Flight Suggestions Screen**: Upload interface for flight preferences (conditional)
- **Page 8 - Trip Objective Screen**: Justification and final details
- **Confirmation Screen**: Summary of submitted data with reference number
- **Admin Dashboard**: Table view with filters, search, and status management

### Accessibility: None
Standard web usability without specific accessibility compliance requirements.

### Branding
- **Background**: Fixed image using provided background.png (cyan to purple gradient with wave patterns)
- **CEIA brain logo**: Positioned in header/login page
- **Clean, modern typography**: Inter or system fonts
- **Form styling**: Clean white/semi-transparent cards over background image
- **Authentication providers**: Prominent Google and Microsoft login buttons with official branding

### Target Device and Platforms: Web Responsive
Primary target is desktop browsers (Chrome, Firefox, Edge) with responsive design that adapts to tablet screens. Mobile optimization is designated for Phase 2.
