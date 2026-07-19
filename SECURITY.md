# Security Notes (Node.js + Express API)

This project uses a Node.js/Express backend and a React frontend.

## What is secured

- `helmet` security headers enabled with CSP and frame protection.
- CORS allowlist via `ALLOWED_ORIGINS` to limit browser origins.
- API-wide rate limiting and a stricter limiter for `/api/contact`.
- Request body limits (`10kb`) to reduce abuse risk.
- Input validation/sanitization for contact submissions.
- Safe JSON error responses (no stack traces in production).
- Static media uses `nosniff` header to reduce content-type attacks.

## Environment

Create `server/.env` from `server/.env.example`.

Required values:

- `PORT`: API server port, example `4000`
- `JWT_SECRET`: long random secret used for JWT signing and verification
- `ALLOWED_ORIGINS`: comma-separated frontend origins, examples:
  - React dev server: `http://localhost:5173`
  - Angular dev server: `http://localhost:4200`

Example:

```env
PORT=4000
JWT_SECRET=replace-with-strong-secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4200
```

## React + Angular + Express architecture

You can run both React and Angular frontends against the same Express API:

- React app calls `/api/*` and `/media/*`
- Angular app can call the same endpoints
- Express remains the single backend service

For Angular, configure its environment API base URL to your backend origin, and include its origin in `ALLOWED_ORIGINS`.

## Production checklist

- Run behind HTTPS (reverse proxy or cloud load balancer)
- Keep secrets out of git (`.env` only)
- Monitor 4xx/5xx logs and rate limit events
- Add persistent storage/email integration for contact submissions
- Add authentication/authorization before handling sensitive user data
