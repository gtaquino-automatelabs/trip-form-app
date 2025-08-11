# Technical Assumptions

### Repository Structure: Monorepo
Using Turborepo structure as specified in the brief, allowing shared components and unified deployment while maintaining clear separation between web app and server concerns.

### Service Architecture
**Monolithic Next.js Application** - Single Next.js 15.3 application with integrated API routes for backend functionality. This provides simplified deployment, unified codebase, and leverages Next.js full-stack capabilities for the MVP scope.

### Testing Requirements
**Unit + Integration Testing** - Implement unit tests for critical business logic (form validation, data transformations) and integration tests for API endpoints and database operations. Manual testing convenience methods for form flow validation.

### Additional Technical Assumptions and Requests

- **Database**: Local Supabase instance (PostgreSQL) running in Docker Desktop
- **Authentication**: Supabase Auth (built-in authentication service)
- **Database Access**: Supabase JS Client for database operations
- **Frontend Framework**: Next.js 15.3 with React 19 and TypeScript for type safety
- **UI Component Library**: shadcn/ui for consistent, customizable components
- **Styling**: TailwindCSS for utility-first styling approach
- **State Management**: Zustand for client-side form state persistence across pages
- **Form Validation**: Zod schemas for runtime validation matching TypeScript types
- **File Handling**: Local filesystem storage for MVP, with uploaded files stored in `public/uploads/` (option for Supabase Storage)
- **Package Manager**: npm 11.4.2 as specified
- **Deployment Target**: Node.js compatible hosting (Vercel, Railway, or similar)
- **Environment Management**: .env files for configuration (Supabase URL, anon key)
- **Session Management**: Supabase Auth session handling
- **Error Tracking**: Console logging for MVP, with structured error responses
- **Development Tools**: ESLint, Prettier for code quality and consistency
- **Real-time Potential**: Supabase real-time subscriptions available for future admin dashboard enhancements
