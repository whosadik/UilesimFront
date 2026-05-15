import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ChevronLeft, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../shared/auth/AuthContext';
import { ApiError } from '../../../../shared/api/ApiError';
import {
  createAdminBrand,
  createAdminProduct,
  deleteAdminProduct,
  getAdminProduct,
  listAdminBrands,
  updateAdminProduct,
  type AdminBrand,
  type AdminProduct,
} from '../../../../shared/api/adminCatalog';

const CATEGORY_OPTIONS = [
  { value: 'skincare', label: 'Skincare' },
  { value: 'haircare', label: 'Haircare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'fragrance', label: 'Fragrance' },
];

const STEP_OPTIONS = [
  { value: '', label: '—' },
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'toner', label: 'Toner' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'spf', label: 'SPF' },
  { value: 'mask', label: 'Mask' },
];

const STRENGTH_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

interface FormState {
  name: string;
  brand_ref: number | null;
  source_product_id: string;
  price: string;
  currency: string;
  category: string;
  product_type: string;
  stock_quantity: string;
  step: string;
  strength: string;
  image_url: string;
  image_urls_text: string;
  description: string;
  application_text: string;
  ingredients_inci: string;
  volume_raw: string;
  concerns_text: string;
  supported_skin_types_text: string;
  actives_text: string;
  flags_text: string;
  attrs_text: string;
  raw_meta_text: string;
  image_file: File | null;
}

const EMPTY_FORM: FormState = {
  name: '',
  brand_ref: null,
  source_product_id: '',
  price: '',
  currency: 'KZT',
  category: 'skincare',
  product_type: '',
  stock_quantity: '0',
  step: '',
  strength: 'low',
  image_url: '',
  image_urls_text: '',
  description: '',
  application_text: '',
  ingredients_inci: '',
  volume_raw: '',
  concerns_text: '',
  supported_skin_types_text: '',
  actives_text: '',
  flags_text: '',
  attrs_text: '{}',
  raw_meta_text: '{}',
  image_file: null,
};

function parseCsvList(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseJsonOrThrow(text: string, field: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`Поле «${field}» содержит невалидный JSON.`);
  }
}

function productToForm(p: AdminProduct): FormState {
  return {
    name: p.name,
    brand_ref: p.brand_ref,
    source_product_id: p.source_product_id || '',
    price: p.price || '',
    currency: p.currency || 'KZT',
    category: p.category,
    product_type: p.product_type || '',
    stock_quantity: String(p.stock_quantity ?? 0),
    step: p.step || '',
    strength: p.strength || 'low',
    image_url: p.image_url || '',
    image_urls_text: (p.image_urls || []).join('\n'),
    description: p.description || '',
    application_text: p.application_text || '',
    ingredients_inci: p.ingredients_inci || '',
    volume_raw: p.volume_raw || '',
    concerns_text: (p.concerns || []).join(', '),
    supported_skin_types_text: (p.supported_skin_types || []).join(', '),
    actives_text: (p.actives || []).join(', '),
    flags_text: (p.flags || []).join(', '),
    attrs_text: JSON.stringify(p.attrs ?? {}, null, 2),
    raw_meta_text: JSON.stringify(p.raw_meta ?? {}, null, 2),
    image_file: null,
  };
}

export default function AdminProductDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  const isNew = !id || id === 'new';
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    listAdminBrands().then(setBrands).catch(() => {});
  }, [isAuthLoading, user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }
    if (isNew) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getAdminProduct(id!);
        if (cancelled) return;
        setProduct(data);
        setForm(productToForm(data));
        setImagePreview(data.image_url_display || '');
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        if (error instanceof Error) toast.error(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isAuthLoading, isNew, location.pathname, navigate, user]);

  const brandLookup = useMemo(() => {
    const map = new Map<number, AdminBrand>();
    brands.forEach((b) => map.set(b.id, b));
    return map;
  }, [brands]);

  const handleImageFile = (file: File | null) => {
    setForm((prev) => ({ ...prev, image_file: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(String(reader.result || ''));
      reader.readAsDataURL(file);
    } else if (product) {
      setImagePreview(product.image_url_display || '');
    } else {
      setImagePreview('');
    }
  };

  const handleCreateBrand = async () => {
    const name = newBrandName.trim();
    if (!name) return;
    setCreatingBrand(true);
    try {
      const brand = await createAdminBrand({ name });
      setBrands((prev) => [...prev, brand].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((prev) => ({ ...prev, brand_ref: brand.id }));
      setNewBrandName('');
      toast.success(`Бренд «${brand.name}» создан`);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else if (error instanceof Error) toast.error(error.message);
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Введите название товара.');
      return;
    }
    if (!form.category) {
      toast.error('Выберите категорию.');
      return;
    }

    let attrs: unknown;
    let raw_meta: unknown;
    try {
      attrs = parseJsonOrThrow(form.attrs_text, 'attrs');
      raw_meta = parseJsonOrThrow(form.raw_meta_text, 'raw_meta');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      return;
    }

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      brand_ref: form.brand_ref,
      source_product_id: form.source_product_id,
      price: form.price || null,
      currency: form.currency,
      category: form.category,
      product_type: form.product_type,
      stock_quantity: Math.max(0, Math.floor(Number(form.stock_quantity) || 0)),
      step: form.step,
      strength: form.strength,
      image_url: form.image_url,
      image_urls: form.image_urls_text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      description: form.description,
      application_text: form.application_text,
      ingredients_inci: form.ingredients_inci,
      volume_raw: form.volume_raw,
      concerns: parseCsvList(form.concerns_text),
      supported_skin_types: parseCsvList(form.supported_skin_types_text),
      actives: parseCsvList(form.actives_text),
      flags: parseCsvList(form.flags_text),
      attrs,
      raw_meta,
    };
    if (form.image_file) {
      payload.image = form.image_file;
    }

    setSaving(true);
    try {
      const saved = isNew
        ? await createAdminProduct(payload)
        : await updateAdminProduct(id!, payload);

      toast.success(isNew ? 'Товар создан' : 'Сохранено');
      setProduct(saved);
      setForm(productToForm(saved));
      setImagePreview(saved.image_url_display || '');
      if (isNew) {
        navigate(`/admin/catalog/products/${saved.id}`, { replace: true });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Не удалось сохранить.');
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(product.id);
      toast.success('Товар удалён');
      navigate('/admin/catalog/products', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else if (error instanceof Error) toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Загружаем…</div>;
  }

  const selectedBrand = form.brand_ref ? brandLookup.get(form.brand_ref) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        to="/admin/catalog/products"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Все товары
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-semibold text-gray-900 text-xl">
          {isNew ? 'Новый товар' : product?.name}
        </h1>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Удалить
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Основное */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Основное</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Бренд</label>
              <div className="flex gap-2">
                <select
                  value={form.brand_ref ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, brand_ref: e.target.value ? Number(e.target.value) : null })
                  }
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="">— Не указан —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {selectedBrand && (
                  <Link
                    to={`/admin/catalog/brands/${selectedBrand.id}`}
                    className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Карточка бренда →
                  </Link>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Создать новый бренд…"
                  className="flex-1 px-3 py-2 text-sm border border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <button
                  onClick={handleCreateBrand}
                  disabled={creatingBrand || !newBrandName.trim()}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 disabled:opacity-50"
                >
                  + Создать бренд
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Цена</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1990.00"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Валюта</label>
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                placeholder="KZT"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Тип товара</label>
              <input
                value={form.product_type}
                onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                placeholder="serum, lipstick, shampoo…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">SKU / source_product_id</label>
              <input
                value={form.source_product_id}
                onChange={(e) => setForm({ ...form, source_product_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Остаток на складе
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = Math.max(0, Math.floor(Number(form.stock_quantity) || 0));
                    setForm({ ...form, stock_quantity: String(Math.max(0, current - 1)) });
                  }}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  aria-label="Уменьшить на 1"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  onBlur={(e) => {
                    const normalized = Math.max(0, Math.floor(Number(e.target.value) || 0));
                    setForm({ ...form, stock_quantity: String(normalized) });
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = Math.max(0, Math.floor(Number(form.stock_quantity) || 0));
                    setForm({ ...form, stock_quantity: String(current + 1) });
                  }}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  aria-label="Увеличить на 1"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                {Number(form.stock_quantity) > 0
                  ? `В наличии · показывается покупателям`
                  : 'Нет в наличии · скрыто из выдачи'}
              </p>
            </div>
          </div>
        </section>

        {/* Изображение */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Главное изображение</h2>
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">Нет фото</span>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                Загрузить файл
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFile(e.target.files?.[0] || null)}
                />
              </label>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Или ссылка (image_url)
                </label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Дополнительные ссылки (по одной на строку)
                </label>
                <textarea
                  value={form.image_urls_text}
                  onChange={(e) => setForm({ ...form, image_urls_text: e.target.value })}
                  rows={3}
                  placeholder="https://…/img1.jpg"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Контент */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Контент карточки</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Применение</label>
              <textarea
                value={form.application_text}
                onChange={(e) => setForm({ ...form, application_text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Состав (INCI)</label>
              <textarea
                value={form.ingredients_inci}
                onChange={(e) => setForm({ ...form, ingredients_inci: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Объём (как указан)</label>
              <input
                value={form.volume_raw}
                onChange={(e) => setForm({ ...form, volume_raw: e.target.value })}
                placeholder="50 мл"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
        </section>

        {/* Атрибуты */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Атрибуты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Step (для skincare)</label>
              <select
                value={form.step}
                onChange={(e) => setForm({ ...form, step: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                {STEP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Strength</label>
              <select
                value={form.strength}
                onChange={(e) => setForm({ ...form, strength: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                {STRENGTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Concerns (через запятую)
              </label>
              <input
                value={form.concerns_text}
                onChange={(e) => setForm({ ...form, concerns_text: e.target.value })}
                placeholder="acne, dryness, hyperpigmentation"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Supported skin types (через запятую)
              </label>
              <input
                value={form.supported_skin_types_text}
                onChange={(e) =>
                  setForm({ ...form, supported_skin_types_text: e.target.value })
                }
                placeholder="oily, dry, sensitive"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Actives (через запятую)
              </label>
              <input
                value={form.actives_text}
                onChange={(e) => setForm({ ...form, actives_text: e.target.value })}
                placeholder="niacinamide, retinol"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Flags (через запятую)</label>
              <input
                value={form.flags_text}
                onChange={(e) => setForm({ ...form, flags_text: e.target.value })}
                placeholder="vegan, fragrance-free"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
        </section>

        {/* Сырой JSON */}
        <details className="bg-white rounded-xl border border-gray-200 p-5">
          <summary className="text-sm font-semibold text-gray-900 cursor-pointer">
            Расширенные поля (JSON)
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">attrs</label>
              <textarea
                value={form.attrs_text}
                onChange={(e) => setForm({ ...form, attrs_text: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">raw_meta</label>
              <textarea
                value={form.raw_meta_text}
                onChange={(e) => setForm({ ...form, raw_meta_text: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
