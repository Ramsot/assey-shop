# Security Guidelines for ASSEY Atelier Frontend

## Principle

The frontend is a public client. **Never store API keys, secrets, or sensitive data in the frontend.**

## Current Security Status ✅

### What's Secure

- **No API keys in frontend code** - Only `NEXT_PUBLIC_API_BASE` environment variable
- **Backend handles all sensitive operations** - Payments, orders, addresses processed server-side
- **Environment-based configuration** - API URL configurable via environment variables
- **Fallback data for static builds** - No hardcoded credentials needed

### Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

## Security Rules

### ❌ NEVER put in frontend

- API keys (Stripe, Google, payment processors)
- Database credentials
- Secret tokens
- Private keys
- Passwords
- Any sensitive configuration

### ✅ ALWAYS put in backend

- Payment processing
- Third-party API integrations
- Database connections
- Secret management
- Business logic validation

## Deployment Security

1. Use environment-specific `.env` files
2. Never commit `.env.local` to version control
3. Validate all data on the backend
4. Use HTTPS in production
5. Implement proper CORS on backend

## Code Review Checklist

- [ ] No hardcoded secrets in frontend code
- [ ] Only `NEXT_PUBLIC_*` variables in frontend
- [ ] Backend validates all requests
- [ ] Sensitive operations proxied through backend
- [ ] No direct third-party API calls from frontend
