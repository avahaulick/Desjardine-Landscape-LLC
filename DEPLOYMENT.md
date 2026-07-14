# Cloud Deployment Guide

## 1) Backend production readiness

The API now includes:

- Proxy-aware Express setup (`TRUST_PROXY`) for cloud load balancers.
- JWT authorization with protected routes.
- Request validation via `celebrate`.
- Centralized error handling with custom error classes.
- Request/error logging to `server/logs/request.log` and `server/logs/error.log`.
- Graceful shutdown support (`SIGTERM`, `SIGINT`).
- Health endpoints:
  - `GET /api/health`
  - `GET /api/ready`

## 2) Required environment variables

Set these in your cloud host:

- `NODE_ENV=production`
- `PORT` (typically injected by host)
- `DATABASE_URL` (MongoDB connection string)
- `JWT_SECRET` (long random string)
- `ALLOWED_ORIGINS=https://your-domain.com`
- `TRUST_PROXY=1`
- `PROJECT_CACHE_TTL_MS=300000` (optional)

## 3) Deploy options

### Option A: Docker (recommended)

Build image:

```bash
docker build -t desjardine-site .
```

Run locally:

```bash
docker run --rm -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATABASE_URL=mongodb://host.docker.internal:27017/wtwr_db \
  -e JWT_SECRET=replace-with-strong-secret \
  -e ALLOWED_ORIGINS=http://localhost:3001 \
  -e TRUST_PROXY=1 \
  desjardine-site
```

### Option B: Node runtime host (Render/Railway/Fly)

Start command:

```bash
npm --prefix server run start
```

Build command:

```bash
npm --prefix client run build
```

## 4) Post-deploy verification checklist

- `GET /api/health` returns 200.
- `GET /api/ready` returns 200.
- `POST /signup` creates users and returns user data without password hash.
- `POST /signin` returns a valid JWT token.
- `GET /items` is public.
- `POST /items` is blocked without auth and succeeds with auth.
- `GET /api/projects` returns project payload.
- Homepage loads and serves gallery images.
- CORS blocks unknown origins.
- CI passes (client lint + client build + backend smoke).

## 5) DNS and HTTPS

- Point domain DNS to your cloud host.
- Enforce HTTPS at host level.
- Confirm security headers are present in production responses.
