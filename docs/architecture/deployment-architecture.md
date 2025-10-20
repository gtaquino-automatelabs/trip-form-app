# Deployment Architecture

## Deployment Strategy

### Frontend Deployment
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **CDN/Edge:** Vercel Edge Network with automatic optimization
- **Static Assets:** Cached at edge locations globally
- **Image Optimization:** Automatic WebP conversion and responsive sizing

### Backend Deployment
- **Platform:** Vercel (same as frontend - monolithic)
- **API Routes:** Serverless functions with automatic scaling
- **Deployment Method:** Vercel automatic deployment from GitHub
- **Function Regions:** Primary in US-East, with edge functions for auth

### Database & Storage
- **Database:** Supabase Cloud (PostgreSQL)
- **Region:** South America (São Paulo) for low latency to Brazil
- **Storage:** Supabase Storage for file attachments
- **Backup Strategy:** Daily automated backups with 30-day retention

### Supporting Services
- **Redis Cache:** Upstash Redis for session management and queues
- **Email Service:** Resend or AWS SES for transactional emails
- **Monitoring:** Vercel Analytics + Custom OpenTelemetry

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy Travel Request System

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run type checking
        run: pnpm type-check
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
      
      - name: Run E2E tests
        run: |
          pnpm playwright install
          pnpm test:e2e

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: pnpm audit
      
      - name: Run OWASP dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'travel-request-system'
          path: '.'
          format: 'HTML'

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        run: pnpm build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: .next

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          
      - name: Comment PR with preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed to Vercel'
            })

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Run smoke tests
        run: |
          pnpm install --frozen-lockfile
          pnpm test:smoke
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Environment Configuration

### Environment Variables
```bash
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
REDIS_HOST=localhost
REDIS_PORT=6379
RESEND_API_KEY=your-resend-key

# .env.production (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
SUPABASE_SERVICE_KEY=production-service-key
REDIS_URL=redis://your-upstash-url
RESEND_API_KEY=production-resend-key
SENTRY_DSN=your-sentry-dsn
```

### Vercel Configuration
```json
{
  "functions": {
    "app/api/admin/export/*.ts": {
      "maxDuration": 60
    },
    "app/api/admin/reports/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup-drafts",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * MON"
    }
  ]
}
```

## Monitoring & Observability

### Monitoring Stack
- **Application Monitoring:** Sentry for error tracking
- **Performance Monitoring:** Vercel Analytics + Web Vitals
- **Uptime Monitoring:** Better Uptime or Pingdom
- **Log Aggregation:** Vercel Logs + Datadog

### OpenTelemetry Setup
```typescript
// lib/monitoring/telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'travel-request-system',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.VERCEL_GIT_COMMIT_SHA,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();
```

### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    api: 'healthy',
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
  };
  
  const isHealthy = Object.values(checks).every(
    status => status === 'healthy'
  );
  
  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 }
  );
}
```

## Scaling Strategy

### Horizontal Scaling
- **Vercel Functions:** Automatic scaling from 0 to 1000+ concurrent executions
- **Database Connections:** PgBouncer for connection pooling
- **Redis:** Upstash with automatic scaling
- **File Storage:** Supabase Storage with CDN distribution

### Performance Optimization
1. **Edge Caching:** Static assets cached at 100+ edge locations
2. **Database Indexes:** Optimized queries with proper indexing
3. **API Response Caching:** Redis cache for frequently accessed data
4. **Image Optimization:** Next.js Image component with lazy loading
5. **Code Splitting:** Automatic route-based splitting

### Load Testing
```bash
# K6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const response = http.get('https://your-app.vercel.app/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

## Disaster Recovery

### Backup Strategy
- **Database:** Daily automated backups with point-in-time recovery
- **File Storage:** Cross-region replication for critical documents
- **Configuration:** Version controlled in Git
- **Secrets:** Backed up in secure password manager

### Recovery Procedures
1. **Database Failure:** Restore from latest backup (RPO: 24 hours)
2. **Service Outage:** Automatic failover to backup region
3. **Data Corruption:** Point-in-time recovery to before corruption
4. **Security Breach:** Immediate key rotation and audit

### RTO/RPO Targets
- **Recovery Time Objective (RTO):** 4 hours
- **Recovery Point Objective (RPO):** 24 hours for database, 1 hour for files

## Security Measures

### Security Headers
```typescript
// middleware.ts
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

### Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});
```

### Secrets Management
- Development: `.env.local` (git-ignored)
- Production: Vercel Environment Variables
- Rotation: Quarterly for API keys, annually for certificates

## Maintenance Windows

### Scheduled Maintenance
- **Time:** Sundays 02:00-04:00 BRT
- **Frequency:** Monthly for updates, quarterly for major upgrades
- **Notification:** 72 hours advance notice via email

### Zero-Downtime Deployments
- Rolling deployments with health checks
- Database migrations run separately
- Feature flags for gradual rollout