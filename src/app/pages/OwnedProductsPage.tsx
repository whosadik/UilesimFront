import { useState } from "react";
import { Package, ToggleLeft, ToggleRight, Calendar, Edit2, Check, X } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { toast } from "sonner";

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/me/owned-products/
 * - PATCH /api/me/owned-products/{id}/ - update fields (opened_at, finish_date, notes)
 * - POST /api/me/owned-products/{id}/activate/
 * - POST /api/me/owned-products/{id}/deactivate/
 * 
 * Response: { ok: true, owned_products: [...] }
 */

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

const MOCK_OWNED: OwnedProduct[] = [
  {
    id: "op1",
    product_id: "1",
    product_name: "Увлажняющий крем для лица",
    product_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    brand: "La Roche-Posay",
    category: "Уход за кожей",
    purchase_date: "2024-02-15",
    opened_at: "2024-02-20",
    is_active: true,
    notes: "Использую утром и вечером",
  },
  {
    id: "op2",
    product_id: "2",
    product_name: "Сыворотка с витамином C",
    product_image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    brand: "The Ordinary",
    category: "Уход за кожей",
    purchase_date: "2024-01-10",
    opened_at: "2024-01-12",
    finish_date: "2024-03-01",
    is_active: false,
  },
  {
    id: "op3",
    product_id: "3",
    product_name: "SPF 50 солнцезащитный крем",
    product_image: "https://images.unsplash.com/photo-1614098256829-12caee5a0eaa?w=400",
    brand: "Vichy",
    category: "Уход за кожей",
    purchase_date: "2024-02-28",
    is_active: true,
  },
];

export default function OwnedProductsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [ownedProducts, setOwnedProducts] = useState<OwnedProduct[]>(MOCK_OWNED);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    // TODO: API call
    // POST /api/me/owned-products/{productId}/activate/
    // or POST /api/me/owned-products/{productId}/deactivate/

    setOwnedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: !currentActive } : p))
    );

    toast.success(currentActive ? "Товар деактивирован" : "Товар активирован");
  };

  const handleStartEdit = (product: OwnedProduct) => {
    setEditingId(product.id);
    setEditNotes(product.notes || "");
  };

  const handleSaveNotes = async (productId: string) => {
    // TODO: API call
    // PATCH /api/me/owned-products/{productId}/
    // { notes: editNotes }

    setOwnedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, notes: editNotes } : p))
    );

    setEditingId(null);
    toast.success("Заметки сохранены");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes("");
  };

  const activeCount = ownedProducts.filter((p) => p.is_active).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">Мои товары</h1>
          </div>
          <p className="text-gray-600 mb-4">
            Управляйте вашими покупками: отслеживайте открытые товары и делайте заметки
          </p>

          {/* Stats */}
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
        {ownedProducts.length > 0 ? (
          <div className="space-y-4">
            {ownedProducts.map((product) => (
              <div
                key={product.id}
                className={`p-6 bg-white rounded-xl border transition-all ${
                  product.is_active
                    ? "border-green-200 shadow-sm"
                    : "border-gray-200 opacity-75"
                }`}
              >
                <div className="flex gap-4">
                  {/* Product image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {product.product_name}
                        </h3>
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

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Куплен: {new Date(product.purchase_date).toLocaleDateString("ru-RU")}</span>
                      </div>
                      {product.opened_at && (
                        <div className="flex items-center gap-1">
                          <span>Открыт: {new Date(product.opened_at).toLocaleDateString("ru-RU")}</span>
                        </div>
                      )}
                      {product.finish_date && (
                        <div className="flex items-center gap-1">
                          <span>Закончен: {new Date(product.finish_date).toLocaleDateString("ru-RU")}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      {editingId === product.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Добавьте заметки о товаре..."
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveNotes(product.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Сохранить
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          {product.notes ? (
                            <p className="text-sm text-gray-700 flex-1">{product.notes}</p>
                          ) : (
                            <p className="text-sm text-gray-400 flex-1 italic">Нет заметок</p>
                          )}
                          <button
                            onClick={() => handleStartEdit(product)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {product.is_active ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-600" />
                          Отметить как завершенный
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                          Активировать снова
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-12 h-12" />}
            title="Нет товаров"
            description="Здесь будут отображаться товары, которые вы купили на платформе."
            action={{
              label: "Перейти в каталог",
              onClick: () => (window.location.href = "/catalog"),
            }}
          />
        )}
      </div>
    </div>
  );
}
