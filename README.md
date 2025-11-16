# Frontend User Registration

React + TypeScript single-page app that works with the NestJS backend to deliver a complete authentication flow (sign up, login, token refresh, protected dashboard).

## Features

- Authentication pages for sign-up, login, and a protected dashboard with profile info
- JWT access token stored in memory, refresh token stored in `localStorage`
- Silent session restoration on reload and automatic token refresh via Axios interceptors
- Form validation with React Hook Form + Zod and UI components powered by shadcn/ui
- React Router v7 guarded routes and React Query mutations for login/register actions

## Prerequisites

- Node.js 18+
- Backend API running locally on `http://localhost:3000` (see `backend-user-registration` folder)

## Quick Start

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:5173`. Make sure the backend is running first so API requests succeed.

## Configuration

- Default API base URL lives in `src/api/axiosInstance.ts` (`baseURL: 'http://localhost:3000'`). Update this value if the backend runs elsewhere or expose a `VITE_API_BASE_URL` and import it before building for production.
- Refresh tokens persist in `localStorage` under the key `my_refresh_token` (`src/utils/tokenStore.ts`). Adjust the key if you need to isolate environments.

## Available Scripts

- `npm run dev` – start Vite in development mode
- `npm run build` – type-check and create a production build
- `npm run preview` – serve the production build locally
- `npm run lint` – run ESLint across the project

## Key Screens

- `Home`: entry with calls-to-action
- `SignUp`: registration form calling `POST /user/register`
- `Login`: authentication form calling `POST /auth/login`
- `Dashboard`: protected page displaying profile data from `GET /user/profile`

## Folder Highlights

```
src/
  api/axiosInstance.ts     # Axios instance + interceptors for token refresh
  context/AuthContext.tsx  # Global auth state, silent refresh on bootstrap
  pages/                   # Home, Login, SignUp, Dashboard screens
  components/ProtectedRoute.tsx  # Router guard for authenticated routes
  utils/tokenStore.ts      # Refresh token persistence helpers
  components/ui/           # shadcn/ui primitives
```

## Deployment Checklist

- Build the app with `npm run build`
- Serve the `dist` folder with any static host (Vercel, Netlify, Nginx, etc.)
- Remember to point `axiosInstance` to the deployed backend URL and rebuild before publishing.
