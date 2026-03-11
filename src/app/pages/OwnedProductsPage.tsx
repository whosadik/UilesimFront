import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Package, ToggleLeft, ToggleRight, Calendar, Edit2, Check, X } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { ErrorState } from "../components/ErrorState";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
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

const CATEGORY_LABELS: Record<string, string> = {
  skincare: "Уход за кожей",
  haircare: "Уход за волосами",
  makeup: "Макияж",
  fragrance: "Ароматы",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("ru-RU");
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

function mapOwnedProduct(item: OwnedProductRecord, index: number): OwnedProduct {
  const id = item.id !== undefined && item.id !== null ? String(item.id) : `owned-${index}`;
  const product = isRecord(item.product) ? item.product : null;

  const rawCategory =
    (typeof product?.category === "string" && product.category) ||
    (typeof product?.product_type === "string" && product.product_type) ||
    "";
  const categoryKey = rawCategory.toLowerCase();

  return {
    id,
    product_id:
      product && (typeof product.id === "number" || typeof product.id === "string")
        ? String(product.id)
        : id,
    product_name:
      (typeof product?.name === "string" && product.name.trim()) || `Товар #${id}`,
    product_image:
      (typeof product?.image_url === "string" && product.image_url) ||
      (typeof product?.image === "string" && product.image) ||
      FALLBACK_IMAGE,
    brand: (typeof product?.brand === "string" && product.brand.trim()) || "Uilesim",
    category: CATEGORY_LABELS[categoryKey] ?? rawCategory ?? "Категория не указана",
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

  useEffect(() => {
    let cancelled = false;

    const loadOwnedProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listOwnedProducts();
        const mapped = response.map((item, index) => mapOwnedProduct(item, index));

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
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить список товаров");
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
  }, [location.pathname, navigate, retryKey]);

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

      toast.success(nextIsActive ? "Товар активирован" : "Товар деактивирован");
    } catch (toggleError) {
      if (toggleError instanceof ApiError && (toggleError.status === 401 || toggleError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error("Не удалось обновить статус товара");
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
      toast.error("Дата окончания не может быть раньше даты открытия");
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
      toast.success("Заметки сохранены");
    } catch (saveError) {
      if (saveError instanceof ApiError && (saveError.status === 401 || saveError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error("Не удалось сохранить заметки");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загружаем ваши товары" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">Мои товары</h1>
          </div>
          <p className="text-gray-600 mb-4">
            Управляйте вашими покупками: отслеживайте активные товары и добавляйте заметки.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Всего товаров</p>
              <p className="text-2xl font-semibold text-gray-900">{ownedProducts.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Активные</p>
              <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Завершенные</p>
              <p className="text-2xl font-semibold text-gray-900">
                {ownedProducts.length - activeCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <ErrorState
            title="Не удалось загрузить товары"
            description="Произошла ошибка при загрузке. Попробуйте еще раз."
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
                          {product.is_active ? "Активен" : "Завершен"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Куплен: {formatDate(product.purchase_date)}</span>
                        </div>
                        {product.opened_at && (
                          <div className="flex items-center gap-1">
                            <span>Открыт: {formatDate(product.opened_at)}</span>
                          </div>
                        )}
                        {product.finish_date && (
                          <div className="flex items-center gap-1">
                            <span>Закончен: {formatDate(product.finish_date)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        {editingId === product.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editNotes}
                              onChange={(event) => setEditNotes(event.target.value)}
                              placeholder="Добавьте заметки о товаре..."
                              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                              rows={2}
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Дата открытия</label>
                                <input
                                  type="date"
                                  value={editOpenedAt}
                                  onChange={(event) => setEditOpenedAt(event.target.value)}
                                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Дата окончания</label>
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
                                {isSavingNotes ? "Сохраняем..." : "Сохранить"}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isSavingNotes}
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              {product.notes ? (
                                <p className="text-sm text-gray-700">{product.notes}</p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">Нет заметок</p>
                              )}
                              {(product.opened_at || product.finish_date) && (
                                <p className="mt-2 text-xs text-gray-500">
                                  {product.opened_at ? `Открыт: ${formatDate(product.opened_at)}` : "Открыт: —"}
                                  {" · "}
                                  {product.finish_date ? `Закончен: ${formatDate(product.finish_date)}` : "Закончен: —"}
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
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        disabled={isPending}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {product.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-green-600" />
                            {isPending ? "Обновляем статус..." : "Отметить как завершенный"}
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                            {isPending ? "Обновляем статус..." : "Активировать снова"}
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
            title="Нет товаров"
            description="Здесь будут отображаться товары, которые вы купили на платформе."
            action={{
              label: "Перейти в каталог",
              onClick: () => navigate("/catalog"),
            }}
          />
        )}
      </div>
    </div>
  );
}
