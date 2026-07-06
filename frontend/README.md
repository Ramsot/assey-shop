# ASSEY Atelier — Next.js Frontend

A premium e-commerce storefront built with Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS.

## Getting Started

Install dependencies:

```bash
cd frontend
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

The storefront expects a backend API at `http://localhost:8000/api` by default. Set `NEXT_PUBLIC_API_BASE` to point to a different API.

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run type-check` — Run TypeScript without emitting

## Project Structure

```
src/
├── app/            # Next.js App Router pages
├── components/     # UI, common, and section components
├── hooks/          # Reusable React hooks
├── lib/            # API client and utilities
├── store/          # Zustand global state
├── styles/         # Global CSS and Tailwind tokens
└── types/          # TypeScript type definitions
```

## Backend Integration

This frontend consumes the Django REST API defined in the parent directory.
Ensure the Django server is running at the configured API base URL.
