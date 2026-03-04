# Development Guidelines - Uilesim Platform

## 🎨 Design System

### Цветовая схема
```css
/* Primary CTA/Buttons */
--color-primary: #111827 (Ink - тёмный)

/* Accent */
--color-accent: #FF4DB8 (Розовый)
Используется только для:
- Активного состояния меню
- Бейджей NEW и скидок
- Индикаторов
- Hover эффектов

/* Backgrounds */
--bg-main: white to gray-50 gradient
--bg-card: white
--bg-hover: gray-50
```

### Typography
- Заголовки: font-semibold или font-bold
- Текст: text-gray-900 (основной), text-gray-600 (вторичный)
- Размеры задаются через theme.css, не используйте Tailwind text-* классы для размера шрифта

### Spacing & Layout
- Используйте Auto Layout подход
- Min touch target: 40×40px
- Стандартные отступы: 4, 6, 8, 12px
- Rounded corners: rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)

## 📝 Как добавить новую страницу

### 1. Создайте файл страницы
```tsx
// /src/app/pages/MyNewPage.tsx
import { Breadcrumbs } from '../components/Breadcrumbs';

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/my-endpoint
 * - POST /api/my-endpoint
 * 
 * Rate limits: ...
 */

export default function MyNewPage() {
  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Моя страница' },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
            Заголовок страницы
          </h1>
          <p className="text-gray-600">Описание</p>
        </div>

        {/* Content */}
        <div>
          {/* Ваш контент */}
        </div>
      </div>
    </div>
  );
}
```

### 2. Добавьте роут
```tsx
// /src/app/routes.ts
import MyNewPage from './pages/MyNewPage';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // ... existing routes
      { path: "my-new-page", Component: MyNewPage },
    ],
  },
]);
```

### 3. Добавьте ссылку в навигацию
```tsx
// /src/app/components/Navbar.tsx или MobileMenu.tsx
<Link to="/my-new-page">Моя с��раница</Link>
```

## 🧩 Как создать компонент

### Структура компонента
```tsx
// /src/app/components/MyComponent.tsx
import { SomeIcon } from 'lucide-react';

interface MyComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export function MyComponent({ title, description, onAction }: MyComponentProps) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {onAction && (
        <button onClick={onAction} className="mt-4 text-sm text-pink-500 hover:text-pink-600">
          Действие
        </button>
      )}
    </div>
  );
}
```

### Экспорт типов
Всегда экспортируйте интерфейсы и типы, если компонент работает с данными:
```tsx
export interface Product {
  id: string;
  name: string;
  price: number;
}

export function ProductCard({ product }: { product: Product }) {
  // ...
}
```

## 🎯 Best Practices

### 1. DEV NOTES
Всегда добавляйте DEV NOTES в комментариях к страницам:
```tsx
/**
 * DEV NOTES:
 * Endpoint: GET /api/endpoint
 * Body: { field: type }
 * Response: { ok: true, data: {...} }
 * Rate limit: 10/min
 * 
 * Events: POST /api/me/recommendations/event
 * { event_type: "action_name", ... }
 */
```

### 2. Loading/Empty/Error states
Всегда обрабатывайте состояния:
```tsx
if (isLoading) {
  return <LoadingSpinner size="lg" />;
}

if (!data || data.length === 0) {
  return (
    <EmptyState
      icon={<Icon className="w-12 h-12" />}
      title="Нет данных"
      description="Описание"
    />
  );
}

// Render data
```

### 3. Toast notifications
Используйте toast для feedback:
```tsx
import { toast } from 'sonner';

toast.success('Успешно!');
toast.error('Ошибка');
toast.info('Информация');
```

### 4. Accessibility
- Используйте семантичные HTML теги
- Добавляйте aria-labels к кнопкам без текста
- Используйте Radix UI для сложных компонентов (они accessible by default)

### 5. Responsive design
Всегда делайте адаптивную верстку:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### 6. Иконки
Используйте lucide-react:
```tsx
import { ShoppingCart, Heart, User } from 'lucide-react';

<ShoppingCart className="w-5 h-5" />
```

## 🔗 Links и Navigation

### Internal links
```tsx
import { Link } from 'react-router';

<Link to="/page">Text</Link>
```

### External links
```tsx
<a href="https://..." target="_blank" rel="noopener noreferrer">
  Text
</a>
```

### Programmatic navigation
```tsx
import { useNavigate } from 'react-router';

const navigate = useNavigate();
navigate('/page');
```

## 📦 Состояния и данные

### useState для локального состояния
```tsx
const [value, setValue] = useState<Type>(initialValue);
```

### useEffect для side effects
```tsx
useEffect(() => {
  // Fetch data
  fetchData();
}, [dependencies]);
```

### TODO comments для API integration
```tsx
// TODO: Replace with actual API call
// const response = await fetch('/api/endpoint');
// const data = await response.json();

// Mock data
setTimeout(() => {
  setData(mockData);
}, 500);
```

## 🎨 Стилизация

### Tailwind CSS v4
Используйте Tailwind классы:
```tsx
<div className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
```

### НЕ используйте для font
❌ Не используйте: `text-2xl`, `font-bold`, `leading-tight`
✅ Используйте стили из theme.css или inline стили только если нужно переоп��еделить

### Условные классы
```tsx
<div className={`base-classes ${isActive ? 'active-classes' : 'inactive-classes'}`}>
```

## 🖼️ Изображения

### Unsplash (для mock данных)
```tsx
const image = "https://images.unsplash.com/photo-xxxxx?w=400&q=80";
```

### ImageWithFallback компонент
Для новых изображений используйте:
```tsx
import { ImageWithFallback } from './components/figma/ImageWithFallback';

<ImageWithFallback src={src} alt={alt} />
```

## 💰 Форматирование (Деньги, Даты, Время)

### Money formatting
```tsx
import { formatMoney, formatDiscount } from '../utils/formatters';

formatMoney(10038); // "10 038 ₸"
formatMoney("95.00"); // "95 ₸"
formatDiscount(30); // "−30%"
```

### Date formatting
```tsx
import { 
  formatShortDate, 
  formatDateWithTime, 
  formatCountdown, 
  formatFullDate,
  formatRelativeDate 
} from '../utils/formatters';

formatShortDate(new Date()); // "3 мар"
formatDateWithTime(new Date()); // "до 3 мар, 14:30"
formatCountdown(expiryDate); // "истекает через 3 ч 12 мин"
formatFullDate(new Date()); // "3 марта 2026, 14:32"
formatRelativeDate(new Date()); // "2 дня назад"
```

### Countdown Timer Component
```tsx
import { CountdownTimer } from '../components/CountdownTimer';

<CountdownTimer 
  expiryDate={offerExpiresAt}
  onExpire={() => console.log('Expired!')}
  variant="normal" // or "compact"
/>
```

## 🎭 Skeleton Loading States

Используйте готовые skeleton компоненты для loading состояний:

```tsx
import {
  RecommendationSectionSkeleton,
  NextOfferCardSkeleton,
  LoyaltyWidgetSkeleton,
  ProfileSummarySkeleton,
  ProductGallerySkeleton,
  ProductInfoSkeleton,
  TransactionListSkeleton,
  CarouselSectionSkeleton,
  ListItemSkeleton,
} from '../components/SkeletonComponents';

// В компоненте
if (isLoading) {
  return <RecommendationSectionSkeleton />;
}
```

## ✅ Confirmation Modals

Для подтверждающих диалогов используйте ConfirmModal:

```tsx
import { ConfirmModal } from '../components/ConfirmModal';

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmModal
  open={showConfirm}
  onOpenChange={setShowConfirm}
  title="Удалить товар из корзины?"
  description="Это действие нельзя отменить"
  confirmLabel="Удалить"
  cancelLabel="Отмена"
  onConfirm={() => handleDelete()}
  variant="danger" // or "default"
  isLoading={isDeleting}
/>
```

## 🔄 Формы

### react-hook-form
```tsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  console.log(data);
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('field', { required: true })} />
  {errors.field && <span>Поле обязательно</span>}
</form>
```

## 🎭 Анимации

### Используйте Motion
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Tailwind transitions
```tsx
<div className="transition-all duration-300 hover:scale-105">
```

## 📱 Адаптивность

### Breakpoints
- Mobile: base (390px)
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)
- Large: `xl:` (1280px)

### Пример
```tsx
<div className="px-4 md:px-6 lg:px-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Title
  </h1>
</div>
```

## ⚡ Производительность

### Мемоизация
```tsx
import { memo, useMemo, useCallback } from 'react';

const MyComponent = memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);
  const handleClick = useCallback(() => {}, []);
  
  return <div onClick={handleClick}>{processedData}</div>;
});
```

### Lazy loading
```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

## 🐛 Debugging

### Dev mode checks
```tsx
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

### Error boundaries
Используйте ErrorState компонент для отображения ошибок:
```tsx
<ErrorState
  title="Ошибка"
  message="Что-то пошло не так"
  onRetry={() => fetchData()}
/>
```

## 📋 Checklist для нового компонента

- [ ] TypeScript интерфейсы экспортированы
- [ ] Props задокументированы
- [ ] Loading/Empty/Error states обработаны
- [ ] Адаптивная верстка
- [ ] Accessibility (aria-labels, semantic HTML)
- [ ] Используются цвета из design system
- [ ] Hover/Active states
- [ ] Transitions/Animations (где уместно)
- [ ] DEV NOTES для API integration
- [ ] Toast notifications для actions

## 🚀 Deployment готовность

Перед интеграцией с API убедитесь:
- [ ] Все TODO комментарии с API calls
- [ ] DEV NOTES на всех страницах
- [ ] Mock данные легко заменяются
- [ ] Error handling готов
- [ ] Rate limiting учтен
- [ ] CSRF tokens обрабатываются
- [ ] Session expiry обрабатывается