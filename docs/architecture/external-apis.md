# External APIs

### Supabase Auth API
- **Purpose:** User authentication and session management
- **Documentation:** https://supabase.com/docs/guides/auth
- **Base URL(s):** Configured via NEXT_PUBLIC_SUPABASE_URL
- **Authentication:** Anon key for public operations, service key for admin
- **Rate Limits:** Default Supabase limits apply

**Key Endpoints Used:**
- `POST /auth/v1/token?grant_type=password` - Email/password login
- `GET /auth/v1/authorize` - OAuth authorization
- `POST /auth/v1/logout` - User logout
- `GET /auth/v1/user` - Get current user

**Integration Notes:** Uses @supabase/auth-helpers-nextjs for Next.js integration

### Supabase Database API
- **Purpose:** PostgreSQL database operations via PostgREST
- **Documentation:** https://supabase.com/docs/guides/database
- **Base URL(s):** Configured via NEXT_PUBLIC_SUPABASE_URL
- **Authentication:** RLS policies with user JWT
- **Rate Limits:** Default Supabase limits

**Key Endpoints Used:**
- `POST /rest/v1/travel_requests` - Create travel request
- `GET /rest/v1/travel_requests` - List requests
- `PATCH /rest/v1/travel_requests?id=eq.{id}` - Update request

**Integration Notes:** Row Level Security ensures data isolation per user

### Supabase Storage API
- **Purpose:** File upload and storage for documents
- **Documentation:** https://supabase.com/docs/guides/storage
- **Base URL(s):** Configured via NEXT_PUBLIC_SUPABASE_URL
- **Authentication:** RLS policies on storage buckets
- **Rate Limits:** 5GB bandwidth per month (free tier)

**Key Endpoints Used:**
- `POST /storage/v1/object/{bucket}/{path}` - Upload file
- `GET /storage/v1/object/{bucket}/{path}` - Download file
- `DELETE /storage/v1/object/{bucket}/{path}` - Delete file

**Integration Notes:** Files stored in 'travel-documents' bucket with user-scoped paths
