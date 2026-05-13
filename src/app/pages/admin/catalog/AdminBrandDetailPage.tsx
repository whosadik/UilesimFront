import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ChevronLeft, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../shared/auth/AuthContext';
import { ApiError } from '../../../../shared/api/ApiError';
import {
  createAdminBrand,
  deleteAdminBrand,
  getAdminBrand,
  updateAdminBrand,
  type AdminBrand,
} from '../../../../shared/api/adminCatalog';

type Lang = 'ru' | 'kk' | 'en';

interface FormState {
  name: string;
  description_ru: string;
  description_kk: string;
  description_en: string;
  logo_url: string;
  is_active: boolean;
  logo_image_file: File | null;
}

const EMPTY_FORM: FormState = {
  name: '',
  description_ru: '',
  description_kk: '',
  description_en: '',
  logo_url: '',
  is_active: true,
  logo_image_file: null,
};

export default function AdminBrandDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  const isNew = !id || id === 'new';
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [brand, setBrand] = useState<AdminBrand | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>('ru');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

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
        const data = await getAdminBrand(id!);
        if (cancelled) return;
        setBrand(data);
        setForm({
          name: data.name,
          description_ru: data.description_ru,
          description_kk: data.description_kk,
          description_en: data.description_en,
          logo_url: data.logo_url,
          is_active: data.is_active,
          logo_image_file: null,
        });
        setLogoPreview(data.logo_image_url || '');
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

  const handleLogoFile = (file: File | null) => {
    setForm((prev) => ({ ...prev, logo_image_file: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(String(reader.result || ''));
      reader.readAsDataURL(file);
    } else if (brand) {
      setLogoPreview(brand.logo_image_url || '');
    } else {
      setLogoPreview('');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Введите название бренда.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description_ru: form.description_ru,
        description_kk: form.description_kk,
        description_en: form.description_en,
        logo_url: form.logo_url,
        is_active: form.is_active,
      };
      if (form.logo_image_file) {
        payload.logo_image = form.logo_image_file;
      }

      const saved = isNew
        ? await createAdminBrand(payload)
        : await updateAdminBrand(id!, payload);

      toast.success(isNew ? 'Бренд создан' : 'Сохранено');
      setBrand(saved);
      setForm({
        name: saved.name,
        description_ru: saved.description_ru,
        description_kk: saved.description_kk,
        description_en: saved.description_en,
        logo_url: saved.logo_url,
        is_active: saved.is_active,
        logo_image_file: null,
      });
      setLogoPreview(saved.logo_image_url || '');

      if (isNew) {
        navigate(`/admin/catalog/brands/${saved.id}`, { replace: true });
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
    if (!brand) return;
    if (!window.confirm(`Удалить бренд «${brand.name}»?`)) return;

    setDeleting(true);
    try {
      await deleteAdminBrand(brand.id);
      toast.success('Бренд удалён');
      navigate('/admin/catalog/brands', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Загружаем…</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        to="/admin/catalog/brands"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Все бренды
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-semibold text-gray-900 text-xl">
          {isNew ? 'Новый бренд' : brand?.name}
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
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Напр. La Roche-Posay"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              {brand && (
                <p className="mt-1 text-xs text-gray-500 font-mono">slug: {brand.slug}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Активен (виден в каталоге)
              </label>
            </div>
          </div>
        </section>

        {/* Логотип */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Логотип</h2>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-semibold text-gray-400">
                  {form.name.slice(0, 1).toUpperCase() || '?'}
                </span>
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
                  onChange={(e) => handleLogoFile(e.target.files?.[0] || null)}
                />
              </label>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Или ссылка на лого (URL)
                </label>
                <input
                  type="url"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://…/logo.png"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Описание */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Описание</h2>
          <div className="flex items-center gap-2 mb-3">
            {(['ru', 'kk', 'en'] as Lang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeLang === lang
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {lang === 'ru' ? 'Русский' : lang === 'kk' ? 'Қазақша' : 'English'}
              </button>
            ))}
          </div>
          <textarea
            value={form[`description_${activeLang}` as const]}
            onChange={(e) =>
              setForm({ ...form, [`description_${activeLang}`]: e.target.value } as FormState)
            }
            rows={6}
            placeholder={
              activeLang === 'ru'
                ? 'Краткое описание бренда на русском…'
                : activeLang === 'kk'
                ? 'Бренд туралы қысқа сипаттама…'
                : 'Short brand description…'
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
          />
          <p className="mt-2 text-xs text-gray-500">
            Если оставить пустым — на витрине будет автогенерируемое описание из агрегации товаров.
          </p>
        </section>

        {!isNew && brand && (
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-600">
            Товаров в бренде: <b>{brand.product_count}</b>. Создан:{' '}
            {new Date(brand.created_at).toLocaleString('ru-RU')}.
          </section>
        )}
      </div>
    </div>
  );
}
