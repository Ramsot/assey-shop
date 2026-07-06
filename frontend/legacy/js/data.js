/* ASSEY Atelier — Frontend Configuration
   API base and static fallbacks for when the backend is seeded */

const API = {
  BASE:        '/api',
  PRODUCTS:    '/api/catalog/products/',
  COLLECTIONS: '/api/catalog/collections/',
  CART:        '/api/cart/',
  CART_ADD:    '/api/cart/add/',
  CART_REMOVE: '/api/cart/remove/',
  CART_CLEAR:  '/api/cart/clear/',
  ADDRESSES:   '/api/checkout/addresses/',
  ORDERS:      '/api/checkout/orders/',
  SUMMARY:     '/api/checkout/summary/',
  CONFIRM:     '/api/checkout/orders/confirm/',
};

/* Fallback placeholder image gradient colours by collection */
const COLLECTION_GRADIENTS = {
  signature: 'linear-gradient(135deg,#e8d9be 0%,#d4b896 100%)',
  evening:   'linear-gradient(135deg,#ebc3bf 0%,#d4a0a0 100%)',
  workwear:  'linear-gradient(135deg,#c9d4c0 0%,#a8bc9e 100%)',
  default:   'linear-gradient(135deg,#f0e9de 0%,#e2d5c4 100%)',
};

/* Shipping display labels */
const SHIPPING_LABELS = {
  standard: { label: 'Standard',  detail: '3–5 days',   cost: 'Free'  },
  priority: { label: 'Priority',  detail: '2–3 days',   cost: '$14'   },
  express:  { label: 'Express',   detail: 'Next day',   cost: '$28'   },
};

window.ASSEY = { API, COLLECTION_GRADIENTS, SHIPPING_LABELS };
