# Coding Standards

### Critical Fullstack Rules
- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Form Validation:** Always validate with Zod schemas before database operations
- **File Paths:** Use absolute imports with @ alias for cleaner imports
- **Async Operations:** Always handle loading and error states in UI
- **Database Access:** Only through repository pattern, never direct Supabase calls in routes
- **Auth Checks:** Verify session in every protected API route

### TypeScript Best Practices
- **Use Type-Only Imports:** Always use `import type` for type definitions when `verbatimModuleSyntax` is enabled
- **Validate Zod Versions:** Ensure Zod v3 patterns are used consistently across the codebase
- **Type Form Data:** Use `z.infer<typeof schema>` for automatic type generation from Zod schemas
- **Avoid `any` Types:** Replace with `unknown` or specific types - use type assertions only when necessary
- **Use Type Guards:** Implement proper type narrowing for error handling (e.g., check `instanceof ZodError`)

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `UserProfile.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/user-profile` |
| Database Tables | - | snake_case | `user_profiles` |
