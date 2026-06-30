# Deploying Moderns Milk

This guide covers a low-cost, push-button deploy: **API + Postgres + Redis on
Railway**, **admin web on Vercel**. Alternatives are noted throughout.

> The web app proxies `/bff/*` to the API server-side, so the browser stays
> same-origin and the API's CORS policy never needs to change.

---

## 0. Architecture & services

| Component        | Tech                | Managed option            | Env var(s)                          |
| ---------------- | ------------------- | ------------------------- | ----------------------------------- |
| Admin web        | Next.js 15          | **Vercel** (or Docker)    | `API_ORIGIN`                        |
| API              | NestJS (Node :4000) | **Railway** / Render / Fly| see §2                              |
| Database         | **PostgreSQL 16**   | Neon / Supabase / Railway | `DATABASE_URL`                      |
| Cache / OTP      | **Redis 7**         | Upstash / Railway         | `REDIS_URL`                         |
| Object storage   | MinIO (S3-compat)   | Cloudflare R2 / AWS S3    | `MINIO_*`                           |

---

## 1. Provision data stores

Pick managed services (free tiers exist for all):

- **Postgres** — [Neon](https://neon.tech) or [Supabase](https://supabase.com).
  Copy the connection string into `DATABASE_URL`
  (e.g. `postgresql://user:pass@host/db?sslmode=require`).
- **Redis** — [Upstash](https://upstash.com). Copy `REDIS_URL`
  (`rediss://...` for TLS).
- **Object storage** — [Cloudflare R2](https://developers.cloudflare.com/r2/)
  or AWS S3. Create a bucket and credentials; set the `MINIO_*` vars to point at
  the S3-compatible endpoint.

---

## 2. Deploy the API (Railway)

The API ships with a production `Dockerfile` at `apps/api/Dockerfile`
(**build context = repo root**). It builds the workspace deps, generates the
Prisma client, runs `prisma migrate deploy` on boot, then starts NestJS.

1. Create a new **Railway** project → **Deploy from GitHub repo** → select
   `MilkAdmin`.
2. In the service settings:
   - **Dockerfile path:** `apps/api/Dockerfile`
   - **Root directory / build context:** repository root (default)
3. Add environment variables:

   ```env
   NODE_ENV=production
   API_PORT=4000                            # used only if the platform sets no PORT
   DATABASE_URL=postgresql://...           # from §1
   REDIS_URL=rediss://...                   # from §1
   JWT_ACCESS_SECRET=<openssl rand -hex 32>
   JWT_REFRESH_SECRET=<openssl rand -hex 32>
   JWT_ACCESS_TTL=900
   JWT_REFRESH_TTL=2592000
   OTP_TTL=300
   OTP_MAX_ATTEMPTS=5
   OTP_RESEND_COOLDOWN=60
   SMS_PROVIDER=console                     # swap for a real SMS provider
   # Object storage (R2/S3):
   MINIO_ENDPOINT=...
   MINIO_PORT=443
   MINIO_USE_SSL=true
   MINIO_ROOT_USER=...
   MINIO_ROOT_PASSWORD=...
   ```

4. Deploy. Railway gives you a public URL like
   `https://moderns-milk-api.up.railway.app`. Verify:
   `GET https://<api-url>/api/v1/health` → `{"status":"ok",...}`.

> **Seeding** (first deploy only): migrations run automatically. To load the
> demo catalog/users, run once from the Railway shell or locally against the
> prod `DATABASE_URL`:
> `npm run db:seed -w @moderns-milk/database`

**Alternatives:** the same Dockerfile runs on Render (Web Service, Docker),
Fly.io (`fly launch --dockerfile apps/api/Dockerfile`), DigitalOcean App
Platform, AWS App Runner / ECS Fargate, or Google Cloud Run.

---

## 3. Deploy the web (Vercel)

The repo root `vercel.json` builds the contracts package then the Next app.

1. **Import** the GitHub repo into [Vercel](https://vercel.com/new).
2. **Root Directory:** leave at the **repository root** (the `vercel.json`
   already targets `apps/web`).
3. Vercel reads `vercel.json` automatically:
   - Install: `npm ci`
   - Build: `npx turbo run build --filter=@moderns-milk/web...`
   - Output: `apps/web/.next`
4. **Environment variable:**

   ```env
   API_ORIGIN=https://<your-api-url>        # from §2, no trailing slash, no /api/v1
   ```

5. Deploy. Open the Vercel URL → you're on the login screen. OTPs print to the
   **API** log in dev; wire a real SMS provider for production users.

> **If Vercel insists on per-app root:** set Root Directory to `apps/web`,
> Install Command to `npm ci --workspaces --prefix ../..` is unreliable — prefer
> the repo-root setup above, which is what `vercel.json` is written for.

**Alternatives:** Netlify, Cloudflare Pages, or run the web `Dockerfile`
(`apps/web/Dockerfile`, standalone output) on the same host as the API.

---

## 4. Self-hosted Docker (single VM, optional)

Both Dockerfiles use **repo root** as build context:

```bash
# API
docker build -f apps/api/Dockerfile -t moderns-milk-api .
docker run -p 4000:4000 --env-file .env.prod moderns-milk-api

# Web
docker build -f apps/web/Dockerfile -t moderns-milk-web .
docker run -p 3000:3000 -e API_ORIGIN=http://api:4000 moderns-milk-web
```

Put Postgres + Redis + MinIO alongside (your existing `docker-compose.yml`
covers local; for a server use managed stores or a hardened compose file).

---

## 5. Production checklist

- [ ] **Secrets:** generate real `JWT_*_SECRET` (`openssl rand -hex 32`); never
      ship the `_change_me` placeholders.
- [ ] **TLS DB:** use `sslmode=require` (Postgres) and `rediss://` (Redis).
- [ ] **Migrations:** `prisma migrate deploy` runs on API boot. For
      zero-downtime, move it to a release step (see comment in the Dockerfile).
- [ ] **SMS:** replace `SMS_PROVIDER=console` with a real provider so OTPs reach
      users (backend change in the `auth` module — out of scope for this app).
- [ ] **Object storage:** point `MINIO_*` at R2/S3, not local MinIO.
- [ ] **CORS:** unchanged by design (web → API is server-to-server via `/bff`).
      Only revisit if you ever call the API directly from the browser.
- [ ] **Health checks:** point your platform's health probe at
      `GET /api/v1/health`.
