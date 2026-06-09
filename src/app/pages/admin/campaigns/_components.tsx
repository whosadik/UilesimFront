import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Info, Search, X } from 'lucide-react';
import { type BrandSummary, listBrands } from '../../../../shared/api/brands';
import { type Product, type ProductListResponse, listProducts } from '../../../../shared/api/catalog';
import { useI18n } from '../../../../shared/i18n/LanguageContext';
import { type PickerKind, sameBrand, toggleBrand, toggleNumber } from './_helpers';
import { campaignCopy, formatCampaignMoney } from './campaignI18n';

export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
      <span>{children}</span>
    </p>
  );
}

export function SelectedChips({
  items,
  emptyLabel,
  onRemove,
}: {
  items: Array<{ key: string; label: string }>;
  emptyLabel: string;
  onRemove: (key: string) => void;
}) {
  const { language } = useI18n();
  const copy = campaignCopy[language];

  if (items.length === 0) {
    return <p className="text-sm text-gray-400 italic">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
        >
          {item.label}
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            className="rounded-full text-gray-400 hover:text-gray-700"
            title={copy.common.remove}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export function SelectionField({
  label,
  buttonLabel,
  items,
  emptyLabel,
  hint,
  onOpen,
  onRemove,
}: {
  label: string;
  buttonLabel: string;
  items: Array<{ key: string; label: string }>;
  emptyLabel: string;
  hint?: ReactNode;
  onOpen: () => void;
  onRemove: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-gray-500 font-medium">{label}</label>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Search className="h-3.5 w-3.5" />
          {buttonLabel}
        </button>
      </div>
      <SelectedChips items={items} emptyLabel={emptyLabel} onRemove={onRemove} />
      {hint ? <Hint>{hint}</Hint> : null}
    </div>
  );
}

function unwrapProducts(payload: Product[] | ProductListResponse): Product[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray(payload.results)) {
    return payload.results;
  }
  return [];
}

export function SelectionPickerModal({
  kind,
  selectedBrands,
  selectedProductIds,
  onApplyBrands,
  onApplyProductIds,
  onClose,
}: {
  kind: PickerKind;
  selectedBrands: string[];
  selectedProductIds: number[];
  onApplyBrands: (brands: string[]) => void;
  onApplyProductIds: (productIds: number[]) => void;
  onClose: () => void;
}) {
  const { language } = useI18n();
  const copy = campaignCopy[language];
  const isBrands = kind === 'brands';
  const [search, setSearch] = useState('');
  const [brandRows, setBrandRows] = useState<BrandSummary[]>([]);
  const [productRows, setProductRows] = useState<Product[]>([]);
  const [draftBrands, setDraftBrands] = useState<string[]>(selectedBrands);
  const [draftProductIds, setDraftProductIds] = useState<number[]>(selectedProductIds);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setSearch('');
    setDraftBrands(selectedBrands);
    setDraftProductIds(selectedProductIds);
  }, [kind, selectedBrands, selectedProductIds]);

  useEffect(() => {
    if (!isBrands) return;

    let cancelled = false;
    setLoading(true);
    setLoadError('');

    listBrands()
      .then((rows) => {
        if (!cancelled) setBrandRows(rows);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : copy.picker.loadBrandsError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [copy.picker.loadBrandsError, isBrands]);

  useEffect(() => {
    if (isBrands) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setLoadError('');
      listProducts({ search: search.trim(), page: 1, page_size: 40 })
        .then((payload) => {
          if (!cancelled) setProductRows(unwrapProducts(payload));
        })
        .catch((error) => {
          if (!cancelled) setLoadError(error instanceof Error ? error.message : copy.picker.loadProductsError);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [copy.picker.loadProductsError, isBrands, search]);

  const visibleBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brandRows;
    return brandRows.filter((brand) => brand.name.toLowerCase().includes(q));
  }, [brandRows, search]);

  const apply = () => {
    if (isBrands) {
      onApplyBrands(draftBrands);
    } else {
      onApplyProductIds(draftProductIds);
    }
    onClose();
  };

  const title = isBrands ? copy.picker.brandsTitle : copy.picker.productsTitle;
  const placeholder = isBrands ? copy.picker.searchBrand : copy.picker.searchProduct;
  const selectedCount = isBrands ? draftBrands.length : draftProductIds.length;

  return (
    <div className="fixed inset-0 z-[70] bg-gray-900/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-gray-500">{copy.common.selected(selectedCount)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            title={copy.common.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-gray-100 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder={placeholder}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[430px] overflow-y-auto p-4">
          {loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>
          ) : loading ? (
            <div className="text-sm text-gray-500">{copy.common.loading}</div>
          ) : isBrands ? (
            visibleBrands.length === 0 ? (
              <div className="text-sm text-gray-500">{copy.picker.noBrands}</div>
            ) : (
              <div className="divide-y divide-gray-50 rounded-lg border border-gray-100">
                {visibleBrands.map((brand) => {
                  const checked = draftBrands.some((item) => sameBrand(item, brand.name));
                  return (
                    <label
                      key={brand.slug}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setDraftBrands((current) => toggleBrand(current, brand.name))}
                        className="h-4 w-4 rounded accent-gray-900"
                      />
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                        {brand.logo_letter || brand.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">{brand.name}</span>
                        <span className="block text-xs text-gray-500">
                          {copy.picker.productCount(Number(brand.product_count ?? 0))}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )
          ) : productRows.length === 0 ? (
            <div className="text-sm text-gray-500">{copy.picker.noProducts}</div>
          ) : (
            <div className="divide-y divide-gray-50 rounded-lg border border-gray-100">
              {productRows.map((product) => {
                const checked = draftProductIds.includes(product.id);
                const price =
                  product.price !== undefined && product.price !== null
                    ? formatCampaignMoney(Number(product.price), language)
                    : copy.picker.noPrice;
                return (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setDraftProductIds((current) => toggleNumber(current, product.id))}
                      className="h-4 w-4 rounded accent-gray-900"
                    />
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-gray-500">#{product.id}</span>
                      )}
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900">{product.name}</span>
                      <span className="block truncate text-xs text-gray-500">
                        ID {product.id} · {product.brand || copy.picker.noBrand} · {product.category || copy.picker.noCategory} · {price}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={() => (isBrands ? setDraftBrands([]) : setDraftProductIds([]))}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            {copy.common.clearSelection}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {copy.common.cancel}
            </button>
            <button
              type="button"
              onClick={apply}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              {copy.common.apply}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BannerUploader({
  bannerUrl,
  uploading,
  disabled,
  disabledHint,
  onUrlChange,
  onPickFile,
}: {
  bannerUrl: string;
  uploading: boolean;
  disabled: boolean;
  disabledHint?: string;
  onUrlChange: (url: string) => void;
  onPickFile: (file: File) => void;
}) {
  const { language } = useI18n();
  const copy = campaignCopy[language];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-500 font-medium">{copy.common.banner}</label>
      <input
        type="url"
        value={bannerUrl}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="https://cdn.example.com/campaigns/banner.jpg"
        className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
      <div className="flex items-center gap-3">
        <label
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
            disabled || uploading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) onPickFile(file);
            }}
          />
          {uploading ? copy.common.uploading : copy.common.uploadFile}
        </label>
        {disabled && disabledHint ? <span className="text-xs text-gray-400">{disabledHint}</span> : null}
        {bannerUrl && (
          <button
            type="button"
            onClick={() => onUrlChange('')}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {copy.common.clear}
          </button>
        )}
      </div>
      {bannerUrl && (
        <div className="mt-1 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 max-w-xs">
          <img
            src={bannerUrl}
            alt={copy.common.bannerAlt}
            className="w-full h-32 object-cover"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <p className="text-xs text-gray-400">{copy.common.bannerRequirements}</p>
    </div>
  );
}

export function SpendBar({ spend, budget }: { spend: number; budget: number }) {
  const pct = budget > 0 ? Math.min(100, (spend / budget) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">{pct.toFixed(0)}%</span>
    </div>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  const { language } = useI18n();
  const copy = campaignCopy[language];

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${
        active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      {active ? copy.common.active : copy.common.inactive}
    </span>
  );
}
