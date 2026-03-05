# Mocks Registry

Инвентаризация мок-источников в `src/app/**` на итерации 1.

| Page/Component | Mock source (file/variable) | What it represents | Real endpoint from `/api/schema/` | Notes |
|---|---|---|---|---|
| `src/app/data/products.ts` | `mockProducts` | Базовый каталог товаров | `GET /api/products/`, `GET /api/products/{id}/` | У `products` endpoints trailing slash обязателен, cookie auth в schema |
| `src/app/sections/ForYouSection.tsx` | `mockProducts.slice(...)` | Товары "Для вас" на home | `GET /api/me/recommendations/home` | Без trailing slash, auth required |
| `src/app/sections/TrendingSection.tsx` | `mockProducts.slice(...)` | Товары "В тренде" | `GET /api/products/` | Trailing slash, фильтрация на фронте |
| `src/app/sections/NewArrivalsSection.tsx` | `mockProducts.slice(...)` | Новинки | `GET /api/products/` | Trailing slash |
| `src/app/sections/BrandSpotlightSection.tsx` | `mockProducts.slice(...)` | Блок бренда/товары бренда | `GET /api/products/` | Trailing slash, бренд как query/filter |
| `src/app/sections/ProductFeedSection.tsx` | `mockProductsData` | Лента карточек | `GET /api/products/` | Trailing slash |
| `src/app/pages/CatalogPage.tsx` | `const mockProducts` (+ fallback) | Список товаров каталога | `GET /api/products/` | Trailing slash; в странице уже есть API, мок используется как fallback |
| `src/app/pages/ProductPage.tsx` | `const mockProduct` (+ fallback) | Детальная карточка товара | `GET /api/products/{id}/` | Trailing slash; в странице уже есть API, мок как fallback |
| `src/app/pages/ProfilePage.tsx` | `mockProfile` state | Профиль пользователя | `GET /api/me/profile`, `PUT /api/me/profile` | Без trailing slash, auth required |
| `src/app/pages/ProfilePage.tsx` | `mockLoyalty` state | Баланс/уровень лояльности | `GET /api/me/loyalty` | Без trailing slash, auth required |
| `src/app/pages/ProfilePage.tsx` | `mockFavoriteCategory` | Любимая категория | `GET /api/me/favorite-category` | Без trailing slash, auth required |
| `src/app/pages/ProfilePage.tsx` | `mockRecommendations` | Рекомендации в профиле | `GET /api/me/recommendations/home` | Без trailing slash, auth required |
| `src/app/pages/ForYouPage.tsx` | `mockRecommendations` / `mockTrendingRecs` (fallback state) | Персональные/трендовые рекомендации | `GET /api/me/recommendations/home` | Без trailing slash, auth required; fallback оставлен для устойчивости UI |
| `src/app/pages/ForYouPage.tsx` | offer mock values (`offerCartAmount`, `offerSavingAmount`, fallback) | Персональный оффер | `GET /api/me/next-offer` | Без trailing slash, auth required |
| `src/app/pages/ForYouPage.tsx` | event mock hooks в карточках | Аналитика кликов/показов | `POST /api/me/recommendations/event` | Без trailing slash, auth + CSRF |
| `src/app/pages/TransactionsPage.tsx` | `MOCK_TRANSACTIONS` (fallback state) | История транзакций | `GET /api/transactions/` | Trailing slash, auth required |
| `src/app/pages/OwnedProductsPage.tsx` | `MOCK_OWNED` | Купленные товары пользователя | `GET /api/me/owned-products/` | Trailing slash, auth required |
| `src/app/pages/RoutinePage.tsx` | `MOCK_ROUTINE`, `mockValidation` | Рутина и валидация | `POST /api/routine/generate`, `POST /api/routine/validate` | Оба без trailing slash, auth required |
| `src/app/pages/RoadmapPage.tsx` | `MOCK_STEPS` | Шаги roadmap | `GET /api/me/roadmap` | Без trailing slash, auth required |
| `src/app/pages/PromotionsPage.tsx` | Частично статический оффер (комментарий в файле) | Данные офферов | `GET /api/me/next-offer`, `GET /api/me/offers` | Оба без trailing slash, auth required |
| `src/app/pages/HelpPage.tsx` | `MOCK_FAQ` | FAQ/контент поддержки | Нет явного endpoint в schema | Нужен отдельный CMS/content endpoint |
| `src/app/pages/BrandsPage.tsx` | `mockBrands` | Список брендов | Нет явного `/api/brands` в schema | Можно строить из `GET /api/products/` (агрегация брендов) |
| `src/app/pages/BrandPage.tsx` | `mockProducts` | Товары конкретного бренда | `GET /api/products/` | Trailing slash, бренд через query/filter |
| `src/app/pages/NewArrivalsPage.tsx` | `mockProducts` | Новинки | `GET /api/products/` | Trailing slash |
| `src/app/pages/SalePage.tsx` | `mockProducts` | Акционные товары | `GET /api/products/` | Trailing slash, фильтрация скидок на фронте |
| `src/app/components/Navbar.tsx` | `badge={2}`, `badge={3}` | Счётчики избранного/корзины | Нет явного endpoint в schema | Нужны профильные endpoints для wishlist/cart counters |
| `src/app/pages/admin/AdminCampaignsPage.tsx` | изначальные `campaigns` (частично fallback) | Список кампаний | `GET /api/admin/campaigns` | Без trailing slash, admin auth |
| `src/app/pages/admin/AdminCampaignDetailPage.tsx` | `mockCampaign` (fallback) | Детали кампании | `GET /api/admin/campaigns/{id}`, `PATCH /api/admin/campaigns/{id}`, `POST /api/admin/campaigns` | Без trailing slash, admin auth |
| `src/app/pages/admin/AdminOverviewPage.tsx` | KPI/alerts/tables mock sets (fallback) | Обзор админ-метрик | `GET /api/admin/overview` | Без trailing slash, admin auth |
| `src/app/pages/admin/AdminMetricsPage.tsx` | `generateData`, `channelData` (fallback) | Метрики/графики | `GET /api/admin/metrics` | Без trailing slash, admin auth |
| `src/app/pages/admin/AdminHealthPage.tsx` | `mockServices` (fallback) | Статус сервисов | `GET /api/admin/health` | Без trailing slash, admin auth |
| `src/app/pages/admin/AdminExperimentsPage.tsx` | `experiments` (fallback) | Recs experiments analytics | `GET /api/admin/recs/experiments` | Без trailing slash, admin auth |
| `src/app/pages/admin/AdminAuditPage.tsx` | `mockEntries` | Audit события | `GET /api/admin/audit` | Без trailing slash, admin auth |

