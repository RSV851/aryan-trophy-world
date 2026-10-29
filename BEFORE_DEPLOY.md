# Aryan Trophy World - Pre-Deployment Checklist

Before deploying this application to production (e.g. Vercel + Supabase), follow this checklist:

---

## 1. SmartImage CacheBusting Configuration
- **Development Mode (`npm run dev`)**:
  - `cacheBust = true` on both Public & Admin CMS so all image assets are verified live against Supabase Storage.
- **Production Mode (`npm run build`)**:
  - **Public Site (Visitors)**: Set `cacheBust = false` in `<SmartImage />` on public components (`navbar.tsx`, `page.tsx`, `catalog-client.tsx`, `contact-client.tsx`) to ensure ultra-fast browser disk caching and minimum CDN server load for visitors.
  - **Admin CMS (Owner)**: Keep `cacheBust = true` on all CMS workspaces (`admin-sidebar.tsx`, `settings/page.tsx`, `profile/page.tsx`, `master-data-crud.tsx`, `product-form.tsx`) so the business owner always gets live server verification of uploaded assets.

---

## 2. Environment Variables (.env)
Ensure the following variables are configured in Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `INQUIRY_RATE_LIMIT`

---

## 3. Storage Audit & System Health Checks
- Verify `/api/v1/admin/health-check` runs cleanly and reports 0 missing assets in the CMS Notification Hub (`/admin/notifications`).

---

## 4. Production Build Verification
Run locally before pushing to Vercel:
```bash
npm run build
```
Ensure build completes with **0 errors**.

---

## 5. 🏛️ Enterprise-Level Audit Scope & Architecture
Production-grade audit monitoring is structured into 3 distinct tiers:

### 🟢 Tier 1: In-App Transactional Guard (Instant)
- When Admin updates any Product, Setting, or Media, Next.js API routes perform inline verification.
- If compression fails or a DB constraint is violated, an instant in-app error is raised.

### 🟡 Tier 2: Event-Driven Supabase Webhooks (Microsecond Push)
- Configure Supabase Storage Webhooks on `DELETE` events pointing to `/api/v1/webhooks/supabase-storage`.
- If an object is deleted directly from Supabase Web Dashboard, Supabase automatically pushes a webhook payload raising an instant **🔴 Red Critical System Alert**.

### 🔴 Tier 3: Scheduled Deep SLA & Health Audit (Shared 15s / 15-Min Cron)
- **All Media Assets**: Site Logo, Hero Banner, Curated Cards, Avatar, Product Primary & Gallery photos across all DB tables.
- **Non-Storage External Links**: Settings social links (Instagram, Facebook, LinkedIn), Google Maps Coordinates, and external URLs.
- **Database Connection SLA**: PostgreSQL connection pool latency (`SELECT 1`), handshake timing, and query performance.
- **Network Congestion SLA**: Round-trip time (RTT) and packet-drop indicators.

