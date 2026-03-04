Сделай в Figma два больших набора компонентов: (A) карточки товаров в стиле “как ЗЯ” (минимал, много воздуха, строгая типографика), но адаптированные под бренд Uilesim (розовый только как акцент, primary-кнопки Ink тёмные); (B) экраны и компоненты профиля пользователя под наш проект персонализации и лояльности. Используй Auto Layout, Variants, Constraints, и собери всё на странице “Components / UI Kit”. Сделай Desktop/Tablet/Mobile варианты там, где нужно.

────────────────────────────────────────
A) PRODUCT CARD SYSTEM (как у ЗЯ по логике)

1) ProductCard / Grid (основная карточка)
Размеры (Desktop):
- Card width: 260–280 (для 4-колоночного грида)
- Image area: 1:1, 260×260 (или по ширине карточки)
Структура:
- Верхний ряд поверх изображения (overlay):
  - слева: бейджи (варианты): “NEW”, “-30%”, “2× баллы”, “В наличии/Нет”
  - справа: IconButton “♡” (wishlist) в круге 36×36, фон белый, тень мягкая
- Основная область под изображением:
  - Brand (12–13px, secondary)
  - Title (14–15px, semi-bold, 2 строки max, line-clamp)
  - Mini tags (optional): “подходит для: oily / sensitive” или “SPF 20” (chip, очень тонкий)
  - Price row:
    - current price (16–18px bold)
    - old price (strikethrough, secondary)
    - discount label “-30%” (маленький)
  - Loyalty row (фишка проекта):
    - “+95 баллов” или “+2× баллы” (иконка + текст, очень компактно)
- Bottom action (2 варианта, как у ЗЯ):
  Variant A: одна широкая кнопка “В корзину” (Primary Ink, высота 44)
  Variant B: Qty stepper (− 1 +) появляется после добавления (замена кнопки)
  + рядом справа маленькая иконка “корзина” или “быстро добавить” (опционально)

Стили (строго):
- Фон карточки: белый
- Border: очень лёгкий или вообще без border, тень мягкая
- Primary CTA: Ink (#111827), hover Ink darker
- Розовый (Brand Pink) только для: бейджей NEW, underline активных состояний, focus ring, небольших акцентов
- Никакого фиолетового

Variants (обязательно как Variants):
- default
- with_discount (old price + -%)
- new_badge
- points_multiplier (badge “2× баллы”)
- out_of_stock (CTA disabled, “Нет в наличии”, серый)
- in_cart (stepper вместо кнопки)
- loading_skeleton (image + lines + button skeleton)

2) ProductCard / Carousel (компактная)
- Уже, чтобы помещалось в горизонтальные скроллеры (видно 1.2 карточки на mobile)
- Упрощённый низ: цена + маленькая кнопка “+” (IconButton) вместо большой
Variants: default/discount/new/out_of_stock/skeleton

3) Quick View / Hover (Desktop)
- На hover: появляется мини-панель:
  - “Быстрый просмотр”
  - “В корзину”
  - “Подходит вам: 86%” (если есть recommendation score)
Сделай отдельным вариантом/оверлеем, не ломая mobile.

4) Product List Row (для поиска/листинга)
- Горизонтальная карточка: мини-изображение 96×96, справа контент + цена + кнопка
Variants: default/out_of_stock/skeleton

5) Мини-спеки данных (в Dev notes рядом с компонентами)
Карточка должна поддерживать поля:
- brand, title, image_urls[0], price, old_price, discount_percent
- in_stock
- rating, reviews_count (optional)
- loyalty: points_earned, points_multiplier
- recommendation_score (optional)
Ивенты:
- click/add_to_cart → POST /api/me/recommendations/event (если показ из рекомендаций)

────────────────────────────────────────
B) USER PROFILE / PERSONALIZATION (под контекст проекта)

Сделай 2 уровня: (1) компонентные блоки профиля, (2) экраны профиля (wizard + summary).

1) Profile Summary Card (виджет)
Показывает:
- Avatar (инициалы), имя/“Привет, …”
- Tier + points_balance (Loyalty pill)
- Progress bar “Профиль заполнен на X%”
- CTA: “Заполнить профиль” или “Обновить профиль”
Dev notes: GET /api/me/profile, GET /api/me/loyalty

2) Profile Wizard (многошаговая форма — 5–7 шагов)
Сделай отдельные экраны/stepper компоненты:
- Stepper сверху (шаги/точки)
- Шаг 1: Skin type (chips: dry/oily/combination/normal/sensitive)
- Шаг 2: Goals (multi-select chips)
- Шаг 3: Avoid flags (allergens/fragrance-free/etc) (multi-select)
- Шаг 4: Budget (slider + numeric input)
- Шаг 5: Hair profile (тип волос, проблемы) (optional)
- Шаг 6: Makeup profile (coverage, skin tone) (optional)
- Шаг 7: Fragrance profile (notes, intensity) (optional)
Внизу fixed actions:
- Secondary “Назад”
- Primary Ink “Далее”
- На последнем шаге: “Сохранить профиль”
После сохранения: toast “+50 баллов за завершение профиля” (если awarded=true)

Dev notes:
- PUT /api/me/profile (partial=True)
- bonus response: profile_completion_bonus (awarded/points_added)

Состояния:
- loading (при сохранении)
- validation_error (красные подсказки)
- saved (success toast)

3) Profile Page (итоговая страница /me)
Секции:
- “Ваши данные” (summary + edit)
- “Любимая категория” (карточка с favorite_category + explain collapsed)
  Dev notes: GET /api/me/favorite-category
- “Ваш оффер” (OfferCard: active/none/expired)
  Dev notes: GET /api/me/next-offer, POST /api/offers/click
- “Рекомендации для вас” (2–3 карусели с ProductCard)
  Dev notes: GET /api/me/recommendations/home
- “Мой уход (Routine)” (кнопка generate + превью AM/PM steps)
  Dev notes: POST /api/routine/generate
- “План покупок (Roadmap)” (выбор категории + список шагов)
  Dev notes: GET /api/me/roadmap?category=..., POST /api/me/roadmap/refresh

4) OfferCard (как компонент, 3 состояния)
- active: тип (discount / points_multiplier), value, expires_at, CTA “Применить в корзине”
- none: “Нет подходящих офферов” + CTA “Обновить”
- expired/error: “Оффер истёк” + CTA “Получить новый”
Стили: белая карточка, Ink CTA, розовый только акцент/иконка.

5) Loyalty Widget (tier + points)
- pill tier (Bronze/Silver/Gold), points_balance
- CTA “Потратить баллы” (opens redeem modal placeholder)
Dev notes: GET /api/me/loyalty, POST /api/loyalty/redeem-points

────────────────────────────────────────
C) Технические требования к компонентам (обязательно)
- Все карточки и блоки: Auto Layout, корректные constraints
- Variants: default/hover/pressed/disabled/loading
- Минимум клика 40×40 на mobile
- Именование: Components/ProductCard/*, Components/Profile/*, Components/Offer/*

Результат: полный набор продуктовых карточек + профильные экраны/компоненты, готовые к использованию на Home, Catalog, For You и Product page.