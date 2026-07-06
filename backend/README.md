# ASSEY Atelier — Django Backend

Django REST API for the ASSEY Atelier e-commerce project.

## Project structure

- `assey_store/` — Django project settings, URLs, WSGI
- `catalog/` — products, collections, categories
- `cart/` — cart sessions and line items
- `checkout/` — orders, addresses, payments
- `templates/` — Django templates (admin login)
- `staticfiles/` — collected static files
- `infrastructure/` — nginx and deployment config

## Quick start

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver 8000
```

## API endpoints

- `GET /api/catalog/collections/`
- `GET /api/catalog/products/`
- `GET /api/cart/`
- `POST /checkout/orders/`

## Environment

Copy `.env.example` from the repo root to `.env` and adjust values.
