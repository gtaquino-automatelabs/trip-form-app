# Unified Project Structure

```plaintext
trip-form-app/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
├── apps/                       # Application packages
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App router pages
│       │   │   ├── (auth)/     # Auth group
│       │   │   ├── (protected)/# Protected routes
│       │   │   ├── api/        # API routes
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/     # UI components
│       │   │   ├── ui/         # shadcn/ui
│       │   │   ├── form/       # Form components
│       │   │   ├── admin/      # Admin components
│       │   │   └── auth/       # Auth components
│       │   ├── lib/            # Utilities and helpers
│       │   │   ├── supabase.ts
│       │   │   ├── utils.ts
│       │   │   └── repositories/
│       │   ├── services/       # API client services
│       │   ├── stores/         # Zustand stores
│       │   ├── schemas/        # Zod schemas
│       │   └── types/          # TypeScript types
│       ├── public/             # Static assets
│       │   ├── background.png
│       │   └── uploads/        # Local file uploads
│       ├── tests/              # Tests
│       ├── .env.local          # Environment variables
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/                   # Shared packages
│   └── shared/                 # Shared types/utilities
│       ├── src/
│       │   ├── types/          # Shared TypeScript interfaces
│       │   │   └── index.ts
│       │   └── constants/      # Shared constants
│       └── package.json
├── supabase/                   # Supabase configuration
│   ├── migrations/             # Database migrations
│   │   └── 001_initial_schema.sql
│   ├── config.toml            # Local config
│   └── seed.sql              # Seed data
├── docs/                       # Documentation
│   ├── prd.md
│   └── architecture.md
├── .env.example                # Environment template
├── docker-compose.yml          # Local Supabase setup
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package.json
└── README.md
```
