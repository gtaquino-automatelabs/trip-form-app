# trip-form-app

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Next, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Next.js** - Full-stack React framework
- **Node.js** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
npm install
```
## Database Setup

This project uses **Supabase Cloud** (PostgreSQL) for data storage, authentication, and file storage.

### Cloud Supabase Connection

**Migration Note:** As of October 19, 2025, this project uses Supabase Cloud (sa-east-1 region) instead of local Docker instances.

#### Prerequisites

1. Access to the Supabase Cloud project (`trip-form-app`)
2. Project credentials (available from project administrators)

#### Setup Steps

1. Create `apps/web/.env.local` file with cloud credentials:

```bash
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=https://swsncutfzczgubdzjcpk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-here>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

2. Obtain credentials from:
   - **Supabase Dashboard**: [https://supabase.com/dashboard/project/swsncutfzczgubdzjcpk](https://supabase.com/dashboard/project/swsncutfzczgubdzjcpk)
   - Navigate to: **Project Settings > API**
   - Copy: **Project URL** and **anon public** key

3. Database schema is already applied to cloud instance (migrations completed in Epic 5)

#### Rollback to Local Supabase (if needed)

If you need to rollback to local Supabase Docker:

1. Restore local environment: `cp apps/web/.env.local.backup-local apps/web/.env.local`
2. Uncomment `docker-compose.yml` Supabase service (if commented)
3. Start local Supabase: `docker compose up -d`
4. Verify connection

See `docs/cloud-migration-rollback.md` for detailed rollback instructions.


Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The API routes are available at [http://localhost:3000/api](http://localhost:3000/api).



## Project Structure

```
trip-form-app/
├── apps/
│   ├── web/         # Frontend application (Next.js)
│   └── server/      # Backend API (Next)
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:server`: Start only the server
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:studio`: Open database studio UI
