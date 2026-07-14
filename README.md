# Desjardine Landscaping Cloud API

## Project Description

This project provides a cloud-ready Node.js + Express + MongoDB backend and a React frontend for Desjardine Landscaping LLC. It includes secure authentication, clothing item routes, profile management, gallery data endpoints, centralized error handling, and production deployment support.

## Functionality

- User registration and login with JWT authentication.
- Protected user profile routes (`/users/me`).
- Clothing item CRUD and like/unlike routes (`/items`).
- Public item listing and project gallery listing (`/items`, `/api/projects`).
- Request validation with Celebrate/Joi.
- Logging of all requests and errors to log files.
- Cloud deployment support with Docker and CI workflows.

## Technologies and Techniques

- Node.js + Express
- MongoDB + Mongoose
- JWT auth + bcrypt password hashing
- Celebrate/Joi + validator
- Winston + express-winston logging
- ESLint (airbnb-base) + Prettier
- Docker multi-stage build
- GitHub Actions CI

## Media / Demo

- Add screenshots and GIFs here to show key product flows.
- Add a short video demo link here.

## Deployed Server

- API base URL: https://api.your-domain.com (replace with your active domain)
- Frontend URL: https://your-domain.com (replace with your active domain)

## Local Setup

1. Install dependencies:
   - `npm --prefix server install`
   - `npm --prefix client install --legacy-peer-deps`
2. Start MongoDB locally.
3. Run backend:
   - `npm --prefix server run dev`
4. Run frontend:
   - `npm --prefix client run dev`

## Server Scripts

- `npm --prefix server run start` starts backend on localhost:3001
- `npm --prefix server run dev` starts backend on localhost:3001 with hot reload
- `npm --prefix server run lint` runs backend lint checks
