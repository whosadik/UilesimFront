Добавь в Figma админ-панель для Uilesim (Django staff) в том же стиле “premium minimal”, но более “рабочая” (таблицы, фильтры, графики). Сохрани бренд: primary-кнопки Ink (тёмные), розовый — только аккуратный акцент (чипы/выделения/фокус). Никакого фиолетового. Сделай Desktop 1440 как основной, Tablet 834 упрощённо, Mobile можно только базовые экраны (read-only), если не успеваешь.

Создай новую Figma Page: “App / Admin” и добавь “Components / Admin UI”.

────────────────────────────────────────
1) Admin IA (страницы)
Нарисуй эти экраны:

A) Admin Login
- /admin/login (или отдельный /staff/login)
- состояния: error, loading
Dev notes: SessionAuth + CSRF

B) Admin Shell (общий layout)
- Left sidebar navigation + topbar
- Sidebar пункты:
  1) Overview
  2) Metrics
  3) Recs Experiments
  4) Audit
  5) Campaigns
  6) Cache
  7) Health
- Topbar: search, user/staff menu, environment badge (prod/stage mock)

C) Overview (KPI dashboard)
Dev notes: GET /api/admin/overview (permission: view_metrics)
Контент:
- KPI cards: CTR/CR (если нет — placeholders), promo redemption, retention proxy, active users (mock)
- Mini trend charts (sparkline style)
- Table “Top offers” / “Top categories” (mock)

D) Metrics (графики + фильтры)
Dev notes: GET /api/admin/metrics (view_metrics)
UI:
- Date range picker
- Filters: category, offer type, channel
- 3–5 charts (line/bar) (данные mock)
- Export button (mock)
Состояния: loading/error/empty

E) Recs Experiments
Dev notes: GET /api/admin/recs/experiments (view_metrics)
UI:
- Table experiments: name, status, traffic %, started_at
- Detail drawer: variant info, guardrails (mock)

F) Audit log
Dev notes: GET /api/admin/audit (view_audit) + export.csv
UI:
- Table with pagination (page_size select)
- Filters: date range, actor, action, entity type, search by id
- Row click opens side panel with JSON details (formatted)
Состояния: loading/error/empty

G) Campaigns list
Dev notes: GET /api/admin/campaigns (view_metrics)
UI:
- Table/list of campaigns: name, status, start/end, budget, spend (mock)
- CTA “Create campaign” (requires manage_campaigns)
- Filters: status, date
- Row opens Campaign detail

H) Campaign detail + edit
Dev notes: GET /api/admin/campaigns/{id} + PATCH (manage_campaigns)
UI sections:
- Summary (status, dates, budget)
- Targeting (category/product_type/tier) mock
- Creative (promo text, banner placeholder)
- Save / Publish actions (Ink)
Состояния: saving, validation_error, saved toast

I) Cache invalidate
Dev notes: POST /api/admin/cache/invalidate (invalidate_cache)
UI:
- Input/select “scope” + key (mock)
- CTA “Invalidate”
- Confirmation modal
- Result log list (success/error)

J) Health
Dev notes: GET /api/admin/health (IsAdminUser)
UI:
- Status cards: API ok, DB ok, queue ok (mock)
- Last check timestamp
- Button “Recheck” (mock)

────────────────────────────────────────
2) Admin Components (Components / Admin UI)
Собери компоненты и варианты:
- AdminSidebar item (default/active/hover)
- DataTable (header, rows, sticky header)
- Table row states (hover/selected)
- Pagination + page size select
- FilterBar (date range, select, search)
- KPI Card (value, delta, sparkline placeholder)
- Chart container (title, legend, empty/loading)
- Drawer/Side panel (for audit details, campaign detail quick view)
- JSON viewer block (monospace, collapsible)
- Permission gate banners:
  - “Недостаточно прав (view_metrics/view_audit/...)”
  - “Требуется staff доступ”
- Skeletons for tables/charts/cards

────────────────────────────────────────
3) Permissions & states
У каждого admin экрана добавь hidden “Dev notes”:
- required permission: view_metrics / view_audit / invalidate_cache / manage_campaigns
- endpoints
- errors: 401/403/429/500
Добавь отдельные state frames:
- 403 Forbidden (нет прав)
- 401 Unauthorized (не залогинен)
- 500 error
- loading skeletons

────────────────────────────────────────
4) Prototype flows (Admin)
В “Flows / Prototype” добавь кликабельные пути:
- Admin login → Overview → Metrics
- Audit list → click row → open drawer JSON
- Campaigns → Create → validation error → save success
- Cache invalidate → confirm → success

Результат: полноценная админка по твоим admin API endpoints, со страницами, таблицами, фильтрами, состояниями, компонентами и прототипом, готовая для реализации.