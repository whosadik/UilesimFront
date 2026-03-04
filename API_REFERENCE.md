# Uilesim API Reference

Краткий справочник всех API endpoints, готовых к интеграции с Django DRF.

## 🔐 Authentication

### SessionAuth + CSRF
```
POST /api-auth/login/
Headers: X-CSRFToken (from cookie)
Body: { username: string, password: string }
Response: { ok: true, user: {...}, session_key: string }
```

## 👤 Profile & User

### Get/Update Profile
```
GET /api/me/profile
Response: { ok: true, profile: {...} }

PUT /api/me/profile (partial=True)
Body: { skin_type, goals, avoid_flags, budget, ... }
Response: { ok: true, profile: {...}, points_awarded?: 50 }
```

### Favorite Category
```
GET /api/me/favorite-category
Response: { ok: true, category: {...} }
```

### Loyalty
```
GET /api/me/loyalty
Response: { ok: true, loyalty: { tier, points, next_tier_points } }
```

## 🛍️ Products

### List Products
```
GET /api/products/?category=&product_type=&brand=&in_stock=&search=
Response: { ok: true, products: [...], pagination: {...} }
```

### Product Detail
```
GET /api/products/{id}/
Response: { ok: true, product: {...} }
```

## ✨ Recommendations

### Home Recommendations
```
GET /api/me/recommendations/home
Response: { ok: true, recommendations: { trending, for_you, new_arrivals } }
```

### Product Bundle
```
GET /api/me/recommendations/bundle?product_id={id}
Response: { ok: true, bundle: [...] }
```

### Track Events
```
POST /api/me/recommendations/event
Headers: X-Request-ID (UUID)
Body: { 
  event_type: "click" | "add_to_cart" | "search" | "wishlist_view",
  product_id?: string,
  query?: string,
  results_count?: number
}
Response: { ok: true }
```

## 🎁 Offers

### Get Next Offer
```
GET /api/me/next-offer
Rate Limit: 10/hour
Response: { ok: true, offer: {...} }
```

### Track Offer Click
```
POST /api/offers/click
Headers: X-Request-ID
Body: { assignment_id: string }
Response: { ok: true }
```

## 🛒 Checkout

### Preview Checkout
```
POST /api/checkout/preview
Rate Limit: 30/min
Body: { 
  items: [{ product_id, quantity }],
  assignment_id?: string,
  redeem_points?: number
}
Response: { 
  ok: true,
  preview: { 
    subtotal, discount, points_discount, total, 
    points_earned, offer_applied 
  }
}
```

### Complete Checkout
```
POST /api/checkout
Headers: X-Request-ID (for idempotency)
Body: { 
  items: [...],
  assignment_id?: string,
  redeem_points?: number,
  idempotency_key: string
}
Response: { 
  ok: true,
  transaction_id: string,
  new_balance: number,
  new_tier?: string,
  next_offer?: {...}
}
```

## 💰 Transactions

### List Transactions
```
GET /api/transactions/?page=1&page_size=20&type=&year=&month=
Response: { ok: true, transactions: [...], pagination: {...} }
```

### Transaction Detail
```
GET /api/transactions/{transaction_id}/
Response: { ok: true, transaction: {...}, items: [...] }
```

## 📦 Owned Products

### List Owned
```
GET /api/me/owned-products/
Response: { ok: true, owned_products: [...] }
```

### Update Owned Product
```
PATCH /api/me/owned-products/{id}/
Body: { opened_at?, finish_date?, notes? }
Response: { ok: true, owned_product: {...} }
```

### Activate/Deactivate
```
POST /api/me/owned-products/{id}/activate/
POST /api/me/owned-products/{id}/deactivate/
Response: { ok: true, owned_product: {...} }
```

## 🗺️ Roadmap

### Get Roadmap
```
GET /api/me/roadmap?category={category}
Response: { ok: true, roadmap: { category, steps: [...], updated_at } }
```

### Refresh Roadmap
```
POST /api/me/roadmap/refresh
Rate Limit: 1/hour per category
Body: { category: string }
Response: { ok: true, roadmap: {...} }
```

### Update Step
```
PATCH /api/me/roadmap/steps/{step_id}
Body: { status: "completed" }
Response: { ok: true, step: {...} }
```

### Track Step Click
```
POST /api/me/roadmap/steps/{step_id}/click
Headers: X-Request-ID
Response: { ok: true }
```

## ⏰ Routine

### Generate Routine
```
POST /api/routine/generate
Rate Limit: 3/day
Body: { profile_id: string }
Response: { ok: true, routine: { morning: [...], evening: [...] } }
```

### Validate Routine
```
POST /api/routine/validate
Rate Limit: 10/day
Body: { routine_steps: [...] }
Response: { 
  ok: true,
  validation: { 
    is_valid: boolean,
    warnings: [...],
    suggestions: [...]
  }
}
```

## ❤️ Wishlist

### Get Wishlist
```
GET /api/me/wishlist/
Response: { ok: true, items: [...] }
```

### Add to Wishlist
```
POST /api/me/wishlist/
Body: { product_id: string }
Response: { ok: true }
```

### Remove from Wishlist
```
DELETE /api/me/wishlist/{product_id}/
Response: { ok: true }
```

## 🏢 Brands (mock)
```
GET /api/brands/
Response: derived from products or mock
```

## 🏪 Stores (mock)
```
GET /api/stores/
Response: mock data
```

## 🎁 Gift Cards (mock)
```
POST /api/gift-cards/purchase
Body: { amount, recipient_email, message }
Response: mock
```

## ⚠️ Error Format

Все ошибки возвращаются в одном из двух форматов:

### Detailed
```json
{
  "ok": false,
  "code": "invalid_credentials",
  "message": "Неверное имя пользователя или пароль",
  "details": {...}
}
```

### Simple
```json
{
  "ok": false,
  "message": "Произошла ошибка"
}
```

## 🎯 Rate Limits

Важные лимиты:
- `/api/me/next-offer`: 10/hour
- `/api/checkout/preview`: 30/min
- `/api/routine/generate`: 3/day
- `/api/routine/validate`: 10/day
- `/api/me/roadmap/refresh`: 1/hour per category

## 📋 Common Headers

### Mutations & Tracking
```
X-Request-ID: UUID (для отслеживания и идемпотентности)
X-CSRFToken: string (для POST/PUT/PATCH/DELETE)
```

## 💡 Notes

1. Все timestamps в ISO 8601 format
2. CSRF token из cookie `csrftoken`
3. Используйте `credentials: 'include'` для fetch
4. idempotency_key для checkout обязателен
5. Все цены в рублях (integer, копейки)
6. Баллы loyalty в целых числах
