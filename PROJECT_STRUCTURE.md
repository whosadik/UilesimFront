# Uilesim E-commerce Platform - Структура проекта

## 📋 Описание
Полноценная премиум e-commerce платформа для бренда косметики Uilesim с системой персонализации, loyalty программой и полным e-commerce флоу.

## 🎨 Дизайн система
- **Primary кнопки**: Тёмные (#111827)
- **Акцентный цвет**: Розовый (#FF4DB8) - активное меню, бейджи NEW/скидок, индикаторы
- **Стиль**: Premium minimal aesthetic с нежным светлым дизайном

## 📁 Структура проекта

### Страницы (Pages)
Всего **29 страниц**:

#### Основные страницы
- `/` - HomePage - главная с hero и секциями
- `/catalog` - CatalogPage - каталог с фильтрами
- `/brands` - BrandsPage - директория брендов
- `/brands/:brand` - BrandPage - страница бренда с табами
- `/new` - NewArrivalsPage - новинки
- `/promotions` - PromotionsPage - акции и промо
- `/sale` - SalePage - распродажа
- `/stores` - StoresPage - магазины
- `/gift-cards` - GiftCardsPage - подарочные карты

#### E-commerce flow
- `/product/:id` - ProductPage - карточка товара
- `/cart` - CartPage - корзина
- `/checkout` - CheckoutPage - оформление заказа
- `/wishlist` - WishlistPage - избранное
- `/search` - SearchPage - поиск товаров

#### Персонализация (For You)
- `/for-you` - ForYouPage - персональный хаб
- `/login` - LoginPage - авторизация (SessionAuth)

#### Профиль (/me)
- `/me` - ProfilePage - профиль пользователя
- `/me/transactions` - TransactionsPage - история транзакций
- `/me/owned` - OwnedProductsPage - мои товары с activate/deactivate
- `/me/roadmap` - RoadmapPage - персональный roadmap по категориям
- `/me/routine` - RoutinePage - генерация и валидация routine

#### Сервисные страницы
- `/help` - HelpPage - центр помощи с FAQ
- `/delivery-returns` - DeliveryReturnsPage - доставка и возврат
- `/terms` - TermsPage - условия использования
- `/privacy` - PrivacyPage - политика конфиденциальности
- `/about` - AboutPage - о бренде

#### Системные страницы
- `/error/500` - ServerErrorPage - ошибка сервера
- `/error/429` - RateLimitPage - превышен лимит запросов
- `/error/session-expired` - SessionExpiredPage - сессия истекла
- `/error/network` - NetworkErrorPage - нет подключения к сети
- `*` - NotFoundPage - 404

### Компоненты (Components)
**25+ UI компонентов**:

#### Основные компоненты
- `Navbar` - навигация с mega menu и profile dropdown
- `MegaMenu` - расширенное меню каталога
- `MobileMenu` - мобильное меню с профилем
- `Footer` - подвал сайта
- `Hero` - главный баннер

#### Карточки (Cards)
- `ProductCard` - карточка товара с loyalty баллами, recommendation score, quick add stepper
- `BrandCard` - карточка бренда
- `PromoCard` - карточка акции
- `PromoBannerCard` - баннер промо
- `OfferCard` - персональный оффер (active/none/expired)
- `ProfileSummaryCard` - сводка профиля
- `ProfileProgressCard` - прогресс заполнения профиля
- `TransactionRow` - строка транзакции
- `RoadmapStepCard` - шаг roadmap

#### Компоненты форм
- `Button` - кнопки (Primary/Secondary/Ghost/Destructive)
- `IconButton` - иконочные кнопки
- `SearchBar` - поиск
- `ProfileWizard` - 7-шаговая форма профиля

#### Навигация
- `Breadcrumbs` - хлебные крошки
- `Chip` - фильтры-чипсы
- `Badge` - бейджи (NEW, скидки)
- `LoyaltyBadge` - бейдж уровня loyalty (Bronze/Silver/Gold/Platinum)

#### Layout компоненты
- `ProductGrid` - сетка товаров
- `ProductCarousel` - карусель товаров
- `CarouselHeader` - заголовок карусели
- `FilterBar` - фильтры (mobile)
- `FilterSidebar` - боковая панель фильтров (desktop)
- `SortSelect` - выбор сортировки
- `DotsIndicator` - индикатор карусели

#### Feedback компоненты
- `EmptyState` - пустое состояние
- `ErrorState` - состояние ошибки
- `LoadingSpinner` - загрузчик
- `Skeleton` - скелетон загрузки
- `SkeletonComponents` - набор skeleton для разных секций (Recommendation, Offer, Loyalty, Profile, Product Gallery/Info, Transactions, Carousel, List Item)
- `AlertBanner` - уведомления (info/success/warning/error)
- `StatMini` - мини-статистика
- `ConfirmModal` - модальное окно подтверждения (danger/default)
- `CountdownTimer` - таймер обратного отсчета для офферов (normal/compact, с warning state)

#### UI Kit (Radix UI + shadcn/ui)
Полный набор компонентов в `/components/ui/`:
- Dialog, Drawer, Sheet, Popover, Tooltip
- Accordion, Tabs, Collapsible
- Select, Checkbox, Radio, Switch, Slider
- Input, Textarea, Form (react-hook-form)
- Alert, Alert Dialog
- Table, Card
- И другие...

### Утилиты (Utils)
- `/utils/formatters.ts` - форматирование денег, дат и времени
  - `formatMoney()` - форматирование с ₸ и пробелами ("10 038 ₸")
  - `formatDiscount()` - форматирование скидки ("−30%")
  - `formatShortDate()` - короткая дата ("12 мар")
  - `formatDateWithTime()` - дата со временем ("до 12 мар, 23:59")
  - `formatCountdown()` - обратный отсчет ("истекает через 3 ч 12 мин")
  - `formatFullDate()` - полная дата ("3 марта 2026, 14:32")
  - `formatRelativeDate()` - относительная дата ("2 дня назад")
  - `getTimeRemaining()` - получение оставшегося времени с warning flag

### Секции (Sections)
- `TrendingSection` - трендовые товары
- `NewArrivalsSection` - новинки
- `BrandSpotlightSection` - бренд недели
- `PromotionsSection` - акции
- `ProductFeedSection` - лента всех товаров
- `ForYouSection` - персональные рекомендации

## 🔄 Навигация (React Router Data Mode)
Используется `react-router` с Data mode паттерном для комплексной навигации.

## 📊 Mock данные
`/data/products.ts` - mock данные товаров для разработки

## 🎯 Ключевые функции

### Персонализация
- **ProfileWizard**: 7-шаговая форма (skin_type, goals, avoid_flags, budget, hair/makeup/fragrance)
- **Roadmap**: персональный план покупок по категориям
- **Routine**: генерация и валидация бьюти-рутины
- **Recommendations**: умные рекомендации с recommendation score

### Loyalty программа
- 4 уровня: Bronze, Silver, Gold, Platinum
- Начисление баллов за покупки
- Отображение баллов на ProductCard
- История транзакций

### E-commerce
- Полный флоу: Catalog → Product → Cart → Checkout
- Quick add stepper на карточках
- Применение офферов в корзине
- Списание loyalty баллов
- Preview перед оформлением

### Owned Products
- Отслеживание купленных товаров
- Activate/Deactivate статус
- Заметки к товарам
- Даты открытия и завершения

## 🚀 API Integration (Готово к подключению)

Все страницы содержат **DEV NOTES** с документацией endpoints:

### Authentication
- `POST /api-auth/login/` - SessionAuth + CSRF

### Profile
- `GET/PUT /api/me/profile`
- `GET /api/me/favorite-category`
- `GET /api/me/loyalty`

### Products
- `GET /api/products/?category=&brand=&in_stock=`
- `GET /api/products/{id}/`

### Recommendations
- `GET /api/me/recommendations/home`
- `GET /api/me/recommendations/bundle?product_id=`
- `POST /api/me/recommendations/event` - tracking

### Offers
- `GET /api/me/next-offer`
- `POST /api/offers/click`

### Checkout
- `POST /api/checkout/preview`
- `POST /api/checkout` - с idempotency_key

### Transactions
- `GET /api/transactions/`
- `GET /api/transactions/{id}/`

### Owned Products
- `GET /api/me/owned-products/`
- `PATCH /api/me/owned-products/{id}/`
- `POST /api/me/owned-products/{id}/activate/`
- `POST /api/me/owned-products/{id}/deactivate/`

### Roadmap
- `GET /api/me/roadmap?category=`
- `POST /api/me/roadmap/refresh`
- `PATCH /api/me/roadmap/steps/{step_id}`

### Routine
- `POST /api/routine/generate`
- `POST /api/routine/validate`

## 📱 Адаптивность
Все страницы и компоненты адаптированы для:
- Desktop (1440px+)
- Tablet (834px)
- Mobile (390px)

## 🎨 Используемые библиотеки
- **React Router** - навигация
- **Radix UI** - accessible UI primitives
- **Lucide React** - иконки
- **Sonner** - toast notifications
- **Motion** - анимации
- **Tailwind CSS v4** - стилизация

## 🔐 Безопасность
- SessionAuth (Django)
- CSRF protection
- Rate limiting awareness
- Session expiry handling

## 📝 Статус
✅ Все страницы созданы
✅ Все компоненты созданы
✅ Навигация настроена
✅ Toast notifications подключены
✅ Accessibility для Dialog компонентов
✅ DEV NOTES для API интеграции
✅ Mock данные для разработки

**Готово к интеграции с Django DRF API!**