import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Package, CheckCircle2, RotateCcw, Calendar, Edit2, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { ErrorState } from "../components/ErrorState";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { useI18n } from "../../shared/i18n/LanguageContext";
import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from "../../shared/catalog/presentation";
import {
  activateOwnedProduct,
  deactivateOwnedProduct,
  listOwnedProducts,
  updateOwnedProduct,
  type OwnedProductRecord,
} from "../../shared/api/ownedProducts";

interface OwnedProduct {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  brand: string;
  category: string;
  purchase_date: string;
  opened_at?: string;
  finish_date?: string;
  is_active: boolean;
  notes?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80";
const ownedProductsPageCopy = {
  ru: {
    categories: { skincare: "Уход за кожей", haircare: "Уход за волосами", makeup: "Макияж", fragrance: "Ароматы" },
    dateMissing: "—",
    productFallback: (id: string) => `Товар #${id}`,
    brandFallback: "Uilesim",
    categoryFallback: "Категория не указана",
    loadError: "Не удалось загрузить список товаров",
    activated: "Товар активирован",
    deactivated: "Товар деактивирован",
    statusError: "Не удалось обновить статус товара",
    invalidFinishDate: "Дата окончания не может быть раньше даты открытия",
    notesSaved: "Заметки сохранены",
    notesError: "Не удалось сохранить заметки",
    loading: "Загружаем ваши товары",
    title: "Мои товары",
    subtitle: "Управляйте вашими покупками: отслеживайте активные товары и добавляйте заметки.",
    total: "Всего товаров",
    active: "Активные",
    completed: "Завершенные",
    errorTitle: "Не удалось загрузить товары",
    errorDescription: "Произошла ошибка при загрузке. Попробуйте еще раз.",
    statusActive: "Активен",
    statusCompleted: "Завершен",
    bought: "Куплен",
    opened: "Открыт",
    finished: "Закончен",
    notesPlaceholder: "Добавьте заметки о товаре...",
    openedDate: "Дата открытия",
    finishedDate: "Дата окончания",
    saving: "Сохраняем...",
    save: "Сохранить",
    cancel: "Отмена",
    noNotes: "Нет заметок",
    updatingStatus: "Обновляем статус...",
    markCompleted: "Отметить как закончившееся",
    activateAgain: "Активировать снова",
    finishConfirmTitle: "Отметить товар как закончившийся?",
    finishConfirmDescription:
      "Товар будет отмечен как закончившийся в вашем профиле. Мы сможем рекомендовать повторную покупку или похожую замену.",
    finishConfirmAction: "Отметить",
    finishConfirmCancel: "Отмена",
    emptyTitle: "Нет товаров",
    emptyDescription: "Здесь будут отображаться товары, которые вы купили на платформе.",
    toCatalog: "Перейти в каталог",
  },
  kk: {
    categories: { skincare: "Тері күтімі", haircare: "Шаш күтімі", makeup: "Макияж", fragrance: "Хош иістер" },
    dateMissing: "—",
    productFallback: (id: string) => `Тауар #${id}`,
    brandFallback: "Uilesim",
    categoryFallback: "Санат көрсетілмеген",
    loadError: "Тауарлар тізімін жүктеу мүмкін болмады",
    activated: "Тауар белсендірілді",
    deactivated: "Тауар өшірілді",
    statusError: "Тауар күйін жаңарту мүмкін болмады",
    invalidFinishDate: "Аяқталу күні ашылу күнінен ерте болмауы керек",
    notesSaved: "Жазбалар сақталды",
    notesError: "Жазбаларды сақтау мүмкін болмады",
    loading: "Тауарларыңызды жүктеп жатырмыз",
    title: "Менің тауарларым",
    subtitle: "Сатып алуларыңызды басқарыңыз: белсенді тауарларды бақылап, жазбалар қосыңыз.",
    total: "Барлық тауар",
    active: "Белсенді",
    completed: "Аяқталған",
    errorTitle: "Тауарларды жүктеу мүмкін болмады",
    errorDescription: "Жүктеу кезінде қате шықты. Қайталап көріңіз.",
    statusActive: "Белсенді",
    statusCompleted: "Аяқталған",
    bought: "Сатып алынған",
    opened: "Ашылған",
    finished: "Аяқталған",
    notesPlaceholder: "Тауар туралы жазба қосыңыз...",
    openedDate: "Ашу күні",
    finishedDate: "Аяқталу күні",
    saving: "Сақтап жатырмыз...",
    save: "Сақтау",
    cancel: "Бас тарту",
    noNotes: "Жазба жоқ",
    updatingStatus: "Күй жаңартылып жатыр...",
    markCompleted: "Аяқталған деп белгілеу",
    activateAgain: "Қайта белсендіру",
    finishConfirmTitle: "Тауарды аяқталды деп белгілейсіз бе?",
    finishConfirmDescription:
      "Тауар сіздің профиліңізде аяқталған деп белгіленеді. Біз сізге қайта сатып алуды немесе ұқсас баламаны ұсына аламыз.",
    finishConfirmAction: "Белгілеу",
    finishConfirmCancel: "Болдырмау",
    emptyTitle: "Тауар жоқ",
    emptyDescription: "Мұнда платформада сатып алған тауарларыңыз көрсетіледі.",
    toCatalog: "Каталогқа өту",
  },
  en: {
    categories: { skincare: "Skincare", haircare: "Haircare", makeup: "Makeup", fragrance: "Fragrance" },
    dateMissing: "—",
    productFallback: (id: string) => `Product #${id}`,
    brandFallback: "Uilesim",
    categoryFallback: "Category not specified",
    loadError: "Could not load the product list",
    activated: "Product activated",
    deactivated: "Product deactivated",
    statusError: "Could not update product status",
    invalidFinishDate: "Finish date cannot be earlier than open date",
    notesSaved: "Notes saved",
    notesError: "Could not save notes",
    loading: "Loading your products",
    title: "My products",
    subtitle: "Manage your purchases: track active products and add notes.",
    total: "Total products",
    active: "Active",
    completed: "Completed",
    errorTitle: "Could not load products",
    errorDescription: "An error occurred while loading. Please try again.",
    statusActive: "Active",
    statusCompleted: "Completed",
    bought: "Bought",
    opened: "Opened",
    finished: "Finished",
    notesPlaceholder: "Add product notes...",
    openedDate: "Open date",
    finishedDate: "Finish date",
    saving: "Saving...",
    save: "Save",
    cancel: "Cancel",
    noNotes: "No notes",
    updatingStatus: "Updating status...",
    markCompleted: "Mark as finished",
    activateAgain: "Activate again",
    finishConfirmTitle: "Mark this product as finished?",
    finishConfirmDescription:
      "The product will be marked as finished in your profile. We'll be able to recommend a repurchase or a similar alternative.",
    finishConfirmAction: "Mark as finished",
    finishConfirmCancel: "Cancel",
    emptyTitle: "No products",
    emptyDescription: "Products you bought on the platform will appear here.",
    toCatalog: "Go to catalog",
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatDate(value: string | undefined, locale: string, emptyLabel: string): string {
  if (!value) {
    return emptyLabel;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return emptyLabel;
  }

  return parsed.toLocaleDateString(locale);
}

function normalizeDateForInput(value?: string): string {
  if (!value) {
    return "";
  }

  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0];
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function mapOwnedProduct(
  item: OwnedProductRecord,
  index: number,
  copy: (typeof ownedProductsPageCopy)[keyof typeof ownedProductsPageCopy],
  language: keyof typeof ownedProductsPageCopy,
): OwnedProduct {
  const id = item.id !== undefined && item.id !== null ? String(item.id) : `owned-${index}`;
  const product = isRecord(item.product) ? item.product : null;

  const rawCategory =
    (typeof product?.category === "string" && product.category) ||
    (typeof product?.product_type === "string" && product.product_type) ||
    "";
  const categoryKey = rawCategory.toLowerCase();
  const categoryLabel =
    copy.categories[categoryKey as keyof typeof copy.categories] ??
    formatCatalogProductTypeLabel(rawCategory, language) ??
    formatCatalogCategoryLabel(rawCategory, language);

  return {
    id,
    product_id:
      product && (typeof product.id === "number" || typeof product.id === "string")
        ? String(product.id)
        : id,
    product_name:
      (typeof product?.name === "string" && product.name.trim()) || copy.productFallback(id),
    product_image:
      (typeof product?.image_url === "string" && product.image_url) ||
      (typeof product?.image === "string" && product.image) ||
      FALLBACK_IMAGE,
    brand: (typeof product?.brand === "string" && product.brand.trim()) || copy.brandFallback,
    category: categoryLabel ?? copy.categoryFallback,
    purchase_date:
      (typeof item.last_acquired_at === "string" && item.last_acquired_at) ||
      (typeof item.acquired_at === "string" && item.acquired_at) ||
      "",
    opened_at: typeof item.opened_at === "string" ? item.opened_at : undefined,
    finish_date: typeof item.finish_date === "string" ? item.finish_date : undefined,
    is_active: item.is_active === undefined ? true : Boolean(item.is_active),
    notes: typeof item.notes === "string" ? item.notes : undefined,
  };
}

export default function OwnedProductsPage() {
  const { language } = useI18n();
  const copy = ownedProductsPageCopy[language];
  const locale = language === "kk" ? "kk-KZ" : language === "en" ? "en-US" : "ru-RU";
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [ownedProducts, setOwnedProducts] = useState<OwnedProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editOpenedAt, setEditOpenedAt] = useState("");
  const [editFinishDate, setEditFinishDate] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [pendingNotesId, setPendingNotesId] = useState<string | null>(null);
  const [confirmFinishProductId, setConfirmFinishProductId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadOwnedProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listOwnedProducts();
        const mapped = response.map((item, index) => mapOwnedProduct(item, index, copy, language));

        if (!cancelled) {
          setOwnedProducts(mapped);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
          return;
        }

        setOwnedProducts([]);
        setError(loadError instanceof Error ? loadError.message : copy.loadError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOwnedProducts();

    return () => {
      cancelled = true;
    };
  }, [copy, language, location.pathname, navigate, retryKey]);

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    setPendingToggleId(productId);

    try {
      const response = currentActive
        ? await deactivateOwnedProduct(productId)
        : await activateOwnedProduct(productId);

      const nextIsActive =
        isRecord(response) && typeof response.is_active === "boolean"
          ? response.is_active
          : !currentActive;

      setOwnedProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, is_active: nextIsActive } : product,
        ),
      );

      toast.success(nextIsActive ? copy.activated : copy.deactivated);
    } catch (toggleError) {
      if (toggleError instanceof ApiError && (toggleError.status === 401 || toggleError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(copy.statusError);
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleStartEdit = (product: OwnedProduct) => {
    setEditingId(product.id);
    setEditNotes(product.notes || "");
    setEditOpenedAt(normalizeDateForInput(product.opened_at));
    setEditFinishDate(normalizeDateForInput(product.finish_date));
  };

  const handleSaveNotes = async (productId: string) => {
    if (editOpenedAt && editFinishDate && editFinishDate < editOpenedAt) {
      toast.error(copy.invalidFinishDate);
      return;
    }

    setPendingNotesId(productId);

    try {
      const response = await updateOwnedProduct(productId, {
        notes: editNotes,
        opened_at: editOpenedAt || null,
        finish_date: editFinishDate || null,
      });

      setOwnedProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                notes: typeof response.notes === "string" ? response.notes : editNotes,
                opened_at: typeof response.opened_at === "string" ? response.opened_at : product.opened_at,
                finish_date:
                  typeof response.finish_date === "string" ? response.finish_date : product.finish_date,
              }
            : product,
        ),
      );

      setEditingId(null);
      toast.success(copy.notesSaved);
    } catch (saveError) {
      if (saveError instanceof ApiError && (saveError.status === 401 || saveError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(copy.notesError);
    } finally {
      setPendingNotesId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes("");
    setEditOpenedAt("");
    setEditFinishDate("");
  };

  const activeCount = useMemo(
    () => ownedProducts.filter((product) => product.is_active).length,
    [ownedProducts],
  );

  if (isLoading) {
    return (
      <div className="page-centered-with-navbar-offset bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text={copy.loading} />
      </div>
    );
  }

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="app-page-container py-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
          </div>
          <p className="text-gray-600 mb-4">{copy.subtitle}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{copy.total}</p>
              <p className="text-2xl font-semibold text-gray-900">{ownedProducts.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{copy.active}</p>
              <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{copy.completed}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {ownedProducts.length - activeCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="app-page-container py-8">
        {error ? (
          <ErrorState
            title={copy.errorTitle}
            description={copy.errorDescription}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : ownedProducts.length > 0 ? (
          <div className="space-y-4">
            {ownedProducts.map((product) => {
              const isPending = pendingToggleId === product.id;
              const isSavingNotes = pendingNotesId === product.id;

              return (
                <div
                  key={product.id}
                  className={`p-6 bg-white rounded-xl border transition-all ${
                    product.is_active
                      ? "border-green-200 shadow-sm"
                      : "border-gray-200 opacity-75"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={product.product_image}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{product.product_name}</h3>
                          <p className="text-sm text-gray-600">
                            {product.brand} • {product.category}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            product.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {product.is_active ? copy.statusActive : copy.statusCompleted}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{copy.bought}: {formatDate(product.purchase_date, locale, copy.dateMissing)}</span>
                        </div>
                        {product.opened_at && (
                          <div className="flex items-center gap-1">
                            <span>{copy.opened}: {formatDate(product.opened_at, locale, copy.dateMissing)}</span>
                          </div>
                        )}
                        {product.finish_date && (
                          <div className="flex items-center gap-1">
                            <span>{copy.finished}: {formatDate(product.finish_date, locale, copy.dateMissing)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        {editingId === product.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editNotes}
                              onChange={(event) => setEditNotes(event.target.value)}
                              placeholder={copy.notesPlaceholder}
                              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                              rows={2}
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">{copy.openedDate}</label>
                                <input
                                  type="date"
                                  value={editOpenedAt}
                                  onChange={(event) => setEditOpenedAt(event.target.value)}
                                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">{copy.finishedDate}</label>
                                <input
                                  type="date"
                                  value={editFinishDate}
                                  onChange={(event) => setEditFinishDate(event.target.value)}
                                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isSavingNotes}
                                onClick={() => handleSaveNotes(product.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                {isSavingNotes ? copy.saving : copy.save}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isSavingNotes}
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4 mr-1" />
                                {copy.cancel}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              {product.notes ? (
                                <p className="text-sm text-gray-700">{product.notes}</p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">{copy.noNotes}</p>
                              )}
                              {(product.opened_at || product.finish_date) && (
                                <p className="mt-2 text-xs text-gray-500">
                                  {product.opened_at ? `${copy.opened}: ${formatDate(product.opened_at, locale, copy.dateMissing)}` : `${copy.opened}: ${copy.dateMissing}`}
                                  {" · "}
                                  {product.finish_date ? `${copy.finished}: ${formatDate(product.finish_date, locale, copy.dateMissing)}` : `${copy.finished}: ${copy.dateMissing}`}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleStartEdit(product)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (product.is_active) {
                            setConfirmFinishProductId(product.id);
                          } else {
                            void handleToggleActive(product.id, product.is_active);
                          }
                        }}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                          product.is_active
                            ? "bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:text-green-700 hover:bg-green-50"
                            : "bg-[#FF4DB8] border-transparent text-white hover:bg-[#e83fa6]"
                        }`}
                      >
                        {product.is_active ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            {isPending ? copy.updatingStatus : copy.markCompleted}
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            {isPending ? copy.updatingStatus : copy.activateAgain}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-12 h-12" />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={{
              label: copy.toCatalog,
              onClick: () => navigate("/catalog"),
            }}
          />
        )}
      </div>

      <AlertDialog
        open={confirmFinishProductId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmFinishProductId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.finishConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{copy.finishConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{copy.finishConfirmCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const productId = confirmFinishProductId;
                setConfirmFinishProductId(null);
                if (productId) {
                  void handleToggleActive(productId, true);
                }
              }}
              className="bg-[#FF4DB8] text-white hover:bg-[#e83fa6]"
            >
              {copy.finishConfirmAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


