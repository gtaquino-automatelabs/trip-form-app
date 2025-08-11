# Source Tree Documentation

## Overview

This document provides a comprehensive view of the Travel Request Form System's source code structure. The project uses a Turborepo monorepo architecture with Next.js 15.3 for both frontend and backend implementation.

## Project Root Structure

```
trip-form-app/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml            # Continuous integration pipeline
│       └── deploy.yaml        # Deployment pipeline
├── apps/                       # Application packages
│   ├── server/                 # Backend server application
│   └── web/                    # Next.js frontend application
├── packages/                   # Shared packages
│   └── shared/                 # Shared types and utilities
├── docs/                       # Project documentation
│   ├── architecture/          # Architecture documentation
│   ├── prd/                   # Product requirements
│   └── ux-design/             # UX/UI documentation
├── supabase/                   # Supabase configuration
├── .env.example               # Environment variables template
├── docker-compose.yml         # Local Supabase setup
├── turbo.json                 # Turborepo configuration
├── package.json               # Root package.json
├── README.md                  # Project readme
└── architecture.md            # Main architecture document
```

## Application Structure

### Web Application (`apps/web/`)

The main Next.js 15.3 application providing the user interface for travel request submission and administration.

```
apps/web/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (auth)/             # Authentication group
│   │   │   ├── login/
│   │   │   │   └── page.tsx   # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx   # Signup page
│   │   ├── (protected)/        # Protected routes
│   │   │   ├── form/
│   │   │   │   ├── layout.tsx # Form layout wrapper
│   │   │   │   └── [page]/
│   │   │   │       └── page.tsx # Dynamic form pages
│   │   │   ├── confirmation/
│   │   │   │   └── page.tsx   # Submission confirmation
│   │   │   └── admin/
│   │   │       ├── layout.tsx # Admin layout
│   │   │       ├── page.tsx   # Admin dashboard
│   │   │       └── requests/
│   │   │           └── [id]/
│   │   │               └── page.tsx # Request details
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── session/
│   │   │   │       └── route.ts
│   │   │   ├── form/           # Form endpoints
│   │   │   │   ├── submit/
│   │   │   │   │   └── route.ts
│   │   │   │   └── draft/
│   │   │   │       └── route.ts
│   │   │   ├── upload/         # File upload endpoint
│   │   │   │   └── route.ts
│   │   │   └── admin/          # Admin endpoints
│   │   │       ├── requests/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts
│   │   │       └── export/
│   │   │           └── route.ts
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── favicon.ico        # App favicon
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── sonner.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── header.tsx     # App header
│   │   │   ├── footer.tsx     # App footer
│   │   │   └── background.tsx # Background styling
│   │   ├── form/               # Form-specific components
│   │   │   ├── form-layout.tsx # Multi-step form wrapper
│   │   │   ├── progress-bar.tsx # Progress indicator
│   │   │   ├── navigation.tsx  # Previous/Next buttons
│   │   │   └── pages/          # Individual form pages
│   │   │       ├── passenger-data.tsx
│   │   │       ├── travel-details.tsx
│   │   │       ├── expense-types.tsx
│   │   │       ├── preferences.tsx
│   │   │       ├── international-travel.tsx
│   │   │       ├── time-restrictions.tsx
│   │   │       ├── flight-preferences.tsx
│   │   │       └── trip-objective.tsx
│   │   ├── admin/              # Admin dashboard components
│   │   │   ├── requests-table.tsx
│   │   │   ├── request-detail.tsx
│   │   │   ├── status-badge.tsx
│   │   │   └── filters.tsx
│   │   ├── auth/               # Authentication components
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   └── auth-guard.tsx
│   │   ├── providers.tsx      # App providers wrapper
│   │   ├── theme-provider.tsx # Theme management
│   │   ├── mode-toggle.tsx    # Dark/light mode toggle
│   │   ├── loader.tsx         # Loading component
│   │   └── header.tsx         # Main header component
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase.ts        # Supabase client setup
│   │   ├── utils.ts           # Utility functions
│   │   ├── api-client.ts      # API client wrapper
│   │   ├── error-handler.ts   # Error handling utilities
│   │   └── repositories/      # Data access layer
│   │       ├── travel-request-repository.ts
│   │       ├── user-repository.ts
│   │       └── file-repository.ts
│   ├── services/              # Business logic services
│   │   ├── auth-service.ts   # Authentication service
│   │   ├── form-service.ts   # Form handling service
│   │   ├── file-service.ts   # File upload service
│   │   └── admin-service.ts  # Admin operations service
│   ├── stores/                # Zustand state management
│   │   ├── form-store.ts     # Form state management
│   │   ├── auth-store.ts     # Authentication state
│   │   └── admin-store.ts    # Admin state
│   ├── schemas/               # Zod validation schemas
│   │   ├── travel-request.ts # Travel request validation
│   │   ├── auth.ts          # Auth validation
│   │   └── common.ts        # Common schemas
│   ├── types/                # TypeScript type definitions
│   │   ├── database.ts      # Database types
│   │   ├── api.ts          # API types
│   │   └── index.ts        # Exported types
│   └── index.css            # Global styles
├── public/                   # Static assets
│   ├── background.png       # Background image
│   └── uploads/            # Local file uploads (dev only)
├── tests/                   # Test files
│   ├── unit/               # Unit tests
│   │   ├── components/
│   │   └── stores/
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── components.json         # shadcn/ui configuration
├── next.config.ts         # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Package dependencies
└── .env.local            # Environment variables (not in git)
```

### Server Application (`apps/server/`)

The backend server application with Prisma ORM and API routes.

```
apps/server/
├── src/
│   ├── app/
│   │   └── route.ts        # Main app route
│   ├── routers/           # API routers
│   │   └── index.ts       # Router configuration
│   └── middleware.ts      # Server middleware
├── prisma/                # Prisma ORM
│   ├── schema/
│   │   └── schema.prisma  # Database schema
│   └── index.ts          # Prisma client
├── supabase/             # Supabase configuration
│   └── config.toml       # Supabase config
├── next.config.ts        # Next.js configuration
├── prisma.config.ts      # Prisma configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Package dependencies
└── next-env.d.ts        # Next.js type definitions
```

### Shared Package (`packages/shared/`)

Shared types, utilities, and constants used across the monorepo.

```
packages/shared/
├── src/
│   ├── types/              # Shared TypeScript interfaces
│   │   ├── travel-request.ts
│   │   ├── user.ts
│   │   ├── status.ts
│   │   └── index.ts       # Type exports
│   ├── constants/          # Shared constants
│   │   ├── status.ts      # Status enums
│   │   ├── routes.ts      # Route constants
│   │   └── index.ts       # Constant exports
│   └── utils/             # Shared utilities
│       ├── date.ts        # Date utilities
│       ├── format.ts      # Formatting utilities
│       └── validation.ts  # Validation helpers
├── tsconfig.json          # TypeScript configuration
└── package.json           # Package configuration
```

## Database Structure

### Supabase Configuration (`supabase/`)

```
supabase/
├── migrations/             # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_add_indexes.sql
│   └── 003_add_rls_policies.sql
├── functions/             # Edge functions (if needed)
├── seed.sql              # Seed data for development
└── config.toml           # Local Supabase configuration
```

## Documentation Structure (`docs/`)

```
docs/
├── architecture/          # Architecture documentation
│   ├── index.md          # Architecture overview
│   ├── introduction.md
│   ├── high-level-architecture.md
│   ├── tech-stack.md
│   ├── data-models.md
│   ├── api-specification.md
│   ├── components.md
│   ├── external-apis.md
│   ├── core-workflows.md
│   ├── database-schema.md
│   ├── frontend-architecture.md
│   ├── backend-architecture.md
│   ├── unified-project-structure.md
│   ├── development-workflow.md
│   ├── deployment-architecture.md
│   ├── security-and-performance.md
│   ├── testing-strategy.md
│   ├── coding-standards.md
│   ├── error-handling-strategy.md
│   ├── monitoring-and-observability.md
│   ├── checklist-results-report.md
│   └── source-tree.md    # This document
├── prd/                  # Product Requirements Document
│   ├── index.md
│   ├── goals-and-background-context.md
│   ├── requirements.md
│   ├── technical-assumptions.md
│   ├── user-interface-design-goals.md
│   ├── epic-list.md
│   ├── epic-1-foundation-authentication-infrastructure.md
│   ├── epic-2-core-form-flow-data-capture.md
│   ├── epic-3-file-handling-form-submission.md
│   ├── epic-4-administrative-dashboard.md
│   ├── next-steps.md
│   └── checklist-results-report.md
├── ux-design/            # UX/UI Documentation
│   └── user-flows-and-wireframes.md
└── front-end-spec.md     # Frontend specifications
```

## Configuration Files

### Root Configuration

- `turbo.json` - Turborepo build orchestration
- `package.json` - Root workspace configuration
- `docker-compose.yml` - Local Supabase setup
- `.env.example` - Environment variables template

### Application Configuration

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - shadcn/ui component configuration

## Key File Purposes

### Core Application Files

| File Path | Purpose |
|-----------|---------|
| `apps/web/src/app/layout.tsx` | Root layout with providers and theme |
| `apps/web/src/app/page.tsx` | Landing page with auth redirect |
| `apps/web/src/middleware.ts` | Auth middleware for protected routes |
| `apps/web/src/lib/supabase.ts` | Supabase client configuration |
| `apps/web/src/stores/form-store.ts` | Multi-step form state management |

### API Route Files

| File Path | Purpose |
|-----------|---------|
| `apps/web/src/app/api/auth/login/route.ts` | User authentication |
| `apps/web/src/app/api/form/submit/route.ts` | Form submission handler |
| `apps/web/src/app/api/upload/route.ts` | File upload handler |
| `apps/web/src/app/api/admin/requests/route.ts` | Admin request listing |

### Component Files

| File Path | Purpose |
|-----------|---------|
| `apps/web/src/components/form/form-layout.tsx` | Multi-step form wrapper |
| `apps/web/src/components/form/pages/*.tsx` | Individual form page components |
| `apps/web/src/components/admin/requests-table.tsx` | Admin dashboard table |
| `apps/web/src/components/ui/*.tsx` | shadcn/ui components |

## Development Conventions

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **API Routes**: kebab-case (e.g., `user-profile/route.ts`)
- **Types**: PascalCase (e.g., `TravelRequest.ts`)

### Directory Organization

- **Feature-based**: Components grouped by feature
- **Shared code**: In `packages/shared` for reuse
- **Tests**: Mirror source structure in `tests/` directory
- **Documentation**: Organized by concern in `docs/`

## Build Outputs

```
.next/                    # Next.js build output
dist/                     # TypeScript build output
.turbo/                   # Turborepo cache
node_modules/             # Dependencies
coverage/                 # Test coverage reports
```

## Ignored Directories

The following directories are excluded from version control:

- `node_modules/` - Package dependencies
- `.next/` - Next.js build output
- `.turbo/` - Turborepo cache
- `dist/` - Build output
- `.git/` - Git repository data
- `coverage/` - Test coverage
- `.env.local` - Local environment variables
- `*.log` - Log files

---

**Document Version:** 1.0  
**Last Updated:** 2025-08-11  
**Maintained By:** Development Team