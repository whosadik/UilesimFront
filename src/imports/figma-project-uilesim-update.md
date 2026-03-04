Дополни текущий Figma-проект Uilesim “финальными недостающими частями”, чтобы дизайн был 100% готов к разработке без пробелов. НЕ меняй стиль и палитру: primary-кнопки Ink (тёмные), розовый — только акцент, светлый premium minimal, мягкие тени, без фиолетового. Работай в существующих Pages: “Components / UI Kit”, “App / Customer”, “Flows / Prototype”.

────────────────────────────────────────
1) Service pages (шаблоны, чтобы не было дыр)
В “App / Customer” добавь шаблонные страницы (Desktop/Tablet/Mobile):
A) /help (Поддержка)
- поиск по FAQ
- список тем (accordion)
- CTA “Написать в поддержку” (mock)
B) /delivery-returns
- 3–5 блоков с иконками + таблица/список условий
C) /terms и /privacy
- типовой layout: sidebar anchors + контент
D) /about (коротко о бренде, 2–3 секции + CTA в каталог)

────────────────────────────────────────
2) Data states framework (единая система состояний)
В “Components / UI Kit” создай набор компонентов состояний и применяй их в экранах:
- State/Loading (skeleton variants для: product grid, carousel section, offer card, loyalty widget, profile card, transactions list)
- State/Empty (универсальный блок):
  - title, description, optional illustration, primary action, secondary action
  - варианты: empty_search, empty_catalog, empty_wishlist, empty_offers, empty_transactions, empty_owned
- State/Error (универсальный блок):
  - network_error, server_error, rate_limit_429, csrf_expired/session_expired, unauthorized_401
  - всегда есть CTA “Повторить” + secondary “На главную” или “Войти”
Правило: любой список/лента/карточка на страницах должен иметь явно отрисованные состояния loading/empty/error.

────────────────────────────────────────
3) Micro-interactions (UI, без кода, но с вариантами)
Сделай компоненты:
- Toast (success/error/warn/info) + placement bottom-left (desktop), bottom-center (mobile)
- Inline spinner внутри кнопок (Button/loading variant)
- “Added to cart” micro UI:
  - после клика ProductCard меняется на stepper variant
  - маленький toast “Добавлено в корзину”
- Wishlist interaction:
  - heart icon toggles (default/active) + small toast “В избранном”
- Modal confirm (минимальная): “Удалить из корзины?” / “Списать баллы?”
Сделай 1–2 фрейма “Interaction examples” с подписью, как меняются варианты.

────────────────────────────────────────
4) Skeletons exactly for ключевых API блоков Home/ForYou
Добавь точные skeleton layout компоненты:
- Skeleton/RecommendationSection (header + 6 карточек placeholder)
- Skeleton/NextOfferCard
- Skeleton/LoyaltyWidget
- Skeleton/ProfileSummary
И вставь их как альтернативные state frames на страницах:
- Home (skeleton версия секций)
- For You (skeleton версия всего экрана)
- Product details (skeleton для gallery + info)

────────────────────────────────────────
5) Formatting стандарты (деньги/даты/таймеры)
Сделай в UI Kit “Formatting spec” (как маленький справочник прямо в Figma):
A) Money format (₸):
- “10 038 ₸” (пробелы как разделители тысяч)
- old price зачёркнут
- discount “−30%”
- note: money приходит строкой “95.00” → UI показывает форматировано
B) Dates:
- “до 12 мар, 23:59” или “истекает через 3 ч 12 мин”
C) Timer component:
- Offer expires countdown (variant: normal / <1h warning)
- warning state не красный кислотный, а аккуратный (нейтральный + маленький розовый акцент)

────────────────────────────────────────
6) Analytics & events touchpoints (Dev notes + UI markers)
Не делай отдельную аналитику-дашборд, но:
- На ключевых компонентах добавь маленькие метки (скрываемые) “Event”:
  - Product click → POST /api/me/recommendations/event (click)
  - Add to cart → POST /api/me/recommendations/event (add_to_cart) если из секции рекомендаций
  - Offer click → POST /api/offers/click (важно X-Request-ID)
  - Checkout → POST /api/checkout (idempotency_key)
  - Roadmap step click → POST /api/me/roadmap/steps/{id}/click
Сделай в каждом ключевом экране группу “Dev notes” (hidden) с:
- endpoint
- required headers (CSRF, X-Request-ID)
- rate limit warnings (особенно /me/next-offer, /checkout/preview)

────────────────────────────────────────
7) Prototype “happy + unhappy paths”
В “Flows / Prototype” добавь 2 ветки:
A) Happy path:
Home → Product → Cart → Preview → Checkout success
B) Unhappy path:
For You → Next-offer (rate limit) → friendly 429 state
Cart → Preview (validation_error) → inline error
Checkout (session expired) → prompt login
Добавь кликабельные hotspots на CTA.

Результат: сервисные страницы + единая система состояний + микро-взаимодействия + skeletons под ключевые API блоки + форматирование денег/дат + аналитические точки + прототип happy/unhappy paths, без изменения визуального направления.