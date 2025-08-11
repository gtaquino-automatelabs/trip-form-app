# Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';`
- XSS Prevention: React automatic escaping + input sanitization
- Secure Storage: Sensitive data in httpOnly cookies, not localStorage

**Backend Security:**
- Input Validation: Zod schemas on all API endpoints
- Rate Limiting: Vercel Edge middleware with 100 requests/minute per IP
- CORS Policy: Same-origin only for production

**Authentication Security:**
- Token Storage: httpOnly secure cookies via Supabase
- Session Management: 7-day rolling sessions with refresh tokens
- Password Policy: Minimum 8 characters, enforced by Supabase Auth

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 250KB initial JS
- Loading Strategy: Code splitting with dynamic imports, progressive enhancement
- Caching Strategy: Next.js ISR with 5-minute revalidation

**Backend Performance:**
- Response Time Target: < 200ms p95 for API routes
- Database Optimization: Indexed queries, connection pooling via Supabase
- Caching Strategy: Next.js Data Cache with on-demand revalidation
