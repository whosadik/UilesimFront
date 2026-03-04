Продолжай проектирование платформы Uilesim в Figma на базе уже готового Header/Navbar (как сейчас) и Home (Hero + секции ниже). Теперь нужно разработать страницы для каждого пункта навбара и собрать полноценный пользовательский флоу. Не меняй палитру: primary-кнопки Ink (тёмные), розовый — только акцент. Стиль: premium minimal, много воздуха, мягкие тени, перламутровые фоны.

────────────────────────────────────────
0) Артборды и организация
Создай страницу (Figma Page) “App / Customer” и внутри сделай фреймы:
- Desktop 1440
- Tablet 834
- Mobile 390
Для каждого экрана: верстка на сетке как в Home, Auto Layout, корректные constraints.
Сделай отдельную страницу “Components / UI Kit”, если ещё нет.

Обязательное правило: один и тот же Header/Navbar используется на всех страницах (component instance).

────────────────────────────────────────
1) Информационная архитектура (что нужно нарисовать)
Нарисуй эти страницы (каждую в Desktop/Tablet/Mobile), используя контентные блоки и компоненты из Home:

A) Каталог (Catalog listing)
- URL concept: /catalog
- Сверху: Breadcrumbs + заголовок “Каталог”
- Слева (desktop): фильтры (категория, product_type, brand, in_stock, price range)
- Справа: grid товаров + сортировка (popular/new/price)
- Пагинация или “Показать ещё”
- Состояния: Loading (skeleton), Empty, Error
- Dev notes: GET /api/products/?category=&product_type=&brand=&in_stock=

B) Бренды (Brands directory)
- /brands
- Поиск бренда + алфавитный индекс (A-Z) + популярные бренды (chips)
- Сетка карточек брендов (logo + name)
- Клик ведёт на страницу бренда
- Dev notes: (временно mock) фильтрация по brand, дальше будет отдельный endpoint

C) Страница бренда (Brand page)
- /brands/{brand}
- Hero бренда (баннер + логотип + описание 2 строки)
- Вкладки: “Хиты”, “Новинки”, “Все товары”
- Ниже: grid товаров бренда
- Dev notes: GET /api/products/?brand=

D) Новинки (New arrivals)
- /new
- Верх: заголовок, фильтры по категории + “в наличии”
- Секции-карусели по категориям + общий grid
- Dev notes: временно mock сортировка “новые”, дальше будет backend-поле; пока используем сортировку на фронте

E) Акции (Promotions)
- /promotions
- Сетка промо-баннеров (как в Home “Акции”, но полноэкранно)
- Фильтры: “скидки”, “2× баллы”, “подарок”, “персональные”
- Каждый промо ведёт на промо-лендинг или подборку товаров
- Dev notes: часть промо от /api/me/next-offer, часть статическая (mock)

F) Для вас (Personal hub)
- /for-you
Сделай страницу-центр персонализации:
1) Карточка статуса профиля:
   - прогресс заполнения + CTA “Заполнить профиль”
   - Dev notes: GET /api/me/profile, PUT /api/me/profile
2) Блок “Рекомендации” (3 секции как /api/me/recommendations/home):
   - For you
   - Because you bought
   - Trending
   - Dev notes: GET /api/me/recommendations/home
3) Блок “Ваш оффер”:
   - карточка active offer + таймер/expiry + CTA “Применить в корзине”
   - Dev notes: GET /api/me/next-offer, POST /api/offers/click
4) Блок “Loyalty”:
   - tier + points_balance + CTA “Потратить баллы”
   - Dev notes: GET /api/me/loyalty
5) Блок “Routine / Roadmap shortcut”:
   - CTA “Собрать уход” (generate routine)
   - CTA “Мой план покупок” (roadmap)
   - Dev notes: POST /api/routine/generate, GET /api/me/roadmap?category=

G) Магазины (Stores)
- /stores
- Список магазинов + карта placeholder
- Фильтр по городу, поиск, карточки магазинов (адрес, часы, телефон)
- (Можно mock, без реального API)

H) Подарочные карты (Gift cards)
- /gift-cards
- 3–4 варианты номиналов, дизайн карточек, выбор “получатель/сообщение”
- CTA “Купить”
- (API можно mock)

I) Скидки до −50% (Sale)
- /sale
- Grid товаров со скидкой (badge -%)
- Фильтры как в каталоге
- (API mock через “has_discount=true” как условный фронтовый фильтр)

────────────────────────────────────────
2) Минимальный e-commerce флоу (обязательно)
Сделай базовые экраны, чтобы связать оффер → корзина → preview → checkout:

1) Product details
- /product/{id}
- Галерея, бренд, название, цена, описание, состав/ingredients, наличие
- CTA “В корзину”
- Блок “Похожие/вместе” (bundle)
- Dev notes: GET /api/products/{id}/, GET /api/me/recommendations/bundle?product_id=

2) Cart
- /cart
- Список товаров, qty stepper
- Блок “Применить оффер” (если есть assignment_id)
- Поле “Списать баллы”
- Кнопка “Предпросмотр” (preview)
- Dev notes: POST /api/checkout/preview

3) Checkout (Result)
- /checkout
- Итоговые суммы (gross/discount/net), начисление/списание баллов, tier
- Success state + transaction_id + новый баланс
- Dev notes: POST /api/checkout (idempotency_key обязателен)

Добавь состояния ошибок (validation_error/offer expired) аккуратно, без жести.

────────────────────────────────────────
3) UI компоненты (добавить/расширить)
Создай/обнови компоненты в UI Kit:
- BrandCard
- FilterSidebar + FilterChips
- ProductGrid + Pagination/LoadMore
- PromoBannerCard
- ProfileProgressCard
- OfferCard (active/none/expired)
- LoyaltyBadge (tier + points)
- Toast/Alert (success/error)
- Skeletons (product card, list)

────────────────────────────────────────
4) Навигация и прототипирование
- Прототипируй основные переходы:
  Home → Catalog → Product → Cart → Checkout
  Home → For You → Offer → Cart
  Brands → Brand page → Product
- Добавь интерактивные hotspots (кнопки и карточки).

────────────────────────────────────────
5) Dev notes (мини)
На каждом экране в отдельной группе “Dev notes” (можно скрыть) добавь 1–3 строки:
- какой endpoint дергаем
- ключевые параметры (filters/sort)
- события (POST /api/me/recommendations/event, offers/click)
Учитывай: primary CTA тёмные; розовый только акцент.

Результат: полный набор экранов по пунктам навбара + базовый checkout flow, в одном стиле, с адаптивами Desktop/Tablet/Mobile.