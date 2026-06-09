import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Offer, OfferType, TargetScope } from '../../../../shared/api/adminOffers';
import { useI18n } from '../../../../shared/i18n/LanguageContext';
import {
  asArrayOfNumbers,
  asArrayOfStrings,
  removeBrand,
  toggleArrayValue,
  type PickerKind,
} from './_helpers';
import { Hint, SelectionField, SelectionPickerModal } from './_components';
import {
  campaignCopy,
  formatCampaignMoney,
  getCampaignCategoryOptions,
  getCampaignProductTypeOptions,
} from './campaignI18n';

export type OfferDraft = {
  id?: number;
  name: string;
  offer_type: OfferType;
  value: string;
  target_scope: TargetScope;
  allowed_categories: string[];
  allowed_brands: string[];
  allowed_product_ids: number[];
  allowed_product_types: string[];
  estimated_cost: string;
  cooldown_days: string;
  expires_in_days: string;
  min_total_spend_90d: string;
  is_active: boolean;
};

export const EMPTY_OFFER: OfferDraft = {
  name: '',
  offer_type: 'discount',
  value: '10',
  target_scope: 'cart',
  allowed_categories: [],
  allowed_brands: [],
  allowed_product_ids: [],
  allowed_product_types: [],
  estimated_cost: '0',
  cooldown_days: '14',
  expires_in_days: '7',
  min_total_spend_90d: '0',
  is_active: true,
};

export function offerToDraft(offer: Offer): OfferDraft {
  return {
    id: offer.id,
    name: offer.name,
    offer_type: offer.offer_type,
    value: String(offer.value ?? '0'),
    target_scope: offer.target_scope,
    allowed_categories: asArrayOfStrings(offer.allowed_categories),
    allowed_brands: asArrayOfStrings(offer.allowed_brands),
    allowed_product_ids: asArrayOfNumbers(offer.allowed_product_ids),
    allowed_product_types: asArrayOfStrings(offer.allowed_product_types),
    estimated_cost: String(offer.estimated_cost ?? '0'),
    cooldown_days: String(offer.cooldown_days ?? 14),
    expires_in_days: String(offer.expires_in_days ?? 7),
    min_total_spend_90d: String(offer.min_total_spend_90d ?? '0'),
    is_active: Boolean(offer.is_active),
  };
}

export function draftToPayload(draft: OfferDraft, campaignId: number) {
  return {
    campaign: campaignId,
    name: draft.name.trim(),
    offer_type: draft.offer_type,
    value: Number(draft.value) || 0,
    target_scope: draft.target_scope,
    allowed_categories: draft.allowed_categories,
    allowed_brands: draft.allowed_brands,
    allowed_product_ids: draft.allowed_product_ids,
    allowed_product_types: draft.allowed_product_types,
    estimated_cost: Number(draft.estimated_cost) || 0,
    cooldown_days: Number(draft.cooldown_days) || 0,
    expires_in_days: Number(draft.expires_in_days) || 7,
    min_total_spend_90d: Number(draft.min_total_spend_90d) || 0,
    is_active: draft.is_active,
  };
}

export function OffersSection({
  offers,
  disabled,
  disabledHint,
  onAdd,
  onEdit,
  onDelete,
}: {
  offers: Offer[];
  disabled: boolean;
  disabledHint?: string;
  onAdd: () => void;
  onEdit: (offer: Offer) => void;
  onDelete: (offer: Offer) => void;
}) {
  const { language } = useI18n();
  const copy = campaignCopy[language];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="font-semibold text-gray-900">{copy.offers.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{copy.offers.subtitle}</p>
        </div>
        <button
          onClick={onAdd}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          {copy.offers.add}
        </button>
      </div>

      {disabled ? (
        <div className="mt-4 text-sm text-gray-500 italic">{disabledHint ?? copy.personal.saveBeforeOffers}</div>
      ) : offers.length === 0 ? (
        <div className="mt-4 text-sm text-gray-500 italic">{copy.offers.empty}</div>
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="py-2 font-medium">{copy.offers.tableName}</th>
                <th className="py-2 font-medium">{copy.offers.tableType}</th>
                <th className="py-2 font-medium">{copy.offers.tableValue}</th>
                <th className="py-2 font-medium">{copy.offers.tableScope}</th>
                <th className="py-2 font-medium">{copy.offers.tableCost}</th>
                <th className="py-2 font-medium">{copy.offers.tableStatus}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-900">{offer.name}</td>
                  <td className="py-2.5 text-gray-700">{copy.offerTypes[offer.offer_type]}</td>
                  <td className="py-2.5 text-gray-700">
                    {offer.offer_type === 'discount'
                      ? `${offer.value}%`
                      : offer.offer_type === 'points_multiplier'
                        ? `x${offer.value}`
                        : String(offer.value)}
                  </td>
                  <td className="py-2.5 text-gray-700">{copy.targetScopes[offer.target_scope].label}</td>
                  <td className="py-2.5 text-gray-700">{formatCampaignMoney(Number(offer.estimated_cost ?? 0), language)}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${
                        offer.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {offer.is_active ? copy.common.active : copy.common.inactive}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => onEdit(offer)}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title={copy.common.edit}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(offer)}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
                        title={copy.common.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function OfferEditorModal({
  draft,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: OfferDraft;
  saving: boolean;
  onChange: (draft: OfferDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { language } = useI18n();
  const copy = campaignCopy[language];
  const categoryOptions = getCampaignCategoryOptions(language);
  const productTypeOptions = getCampaignProductTypeOptions(language);
  const [selectorKind, setSelectorKind] = useState<PickerKind | null>(null);

  const update = <K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  const toggleCat = (value: string) => {
    update('allowed_categories', toggleArrayValue(draft.allowed_categories, value));
  };
  const togglePT = (value: string) => {
    update('allowed_product_types', toggleArrayValue(draft.allowed_product_types, value));
  };

  const showCategoryPicker = draft.target_scope !== 'cart';
  const showBrandPicker = draft.target_scope === 'brand' || draft.target_scope === 'product_id';
  const showProductIdsPicker = draft.target_scope === 'product_id';
  const showProductTypePicker = draft.target_scope === 'product_type' || draft.target_scope === 'product_id';

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-xl my-10 shadow-xl">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{draft.id ? copy.offers.editTitle : copy.offers.newTitle}</h3>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">{copy.common.name}</label>
            <input
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder={copy.offers.namePlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">{copy.offers.type}</label>
              <select
                value={draft.offer_type}
                onChange={(e) => update('offer_type', e.target.value as OfferType)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="discount">{copy.offerTypes.discount}</option>
                <option value="points_multiplier">{copy.offerTypes.points_multiplier}</option>
                <option value="gift">{copy.offerTypes.gift}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {draft.offer_type === 'discount'
                  ? copy.offers.discountValue
                  : draft.offer_type === 'points_multiplier'
                    ? copy.offers.multiplierValue
                    : copy.offers.giftValue}
              </label>
              <input
                type="number"
                value={draft.value}
                onChange={(e) => update('value', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">{copy.offers.scope}</label>
            <select
              value={draft.target_scope}
              onChange={(e) => update('target_scope', e.target.value as TargetScope)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="cart">{copy.targetScopes.cart.label}</option>
              <option value="category">{copy.targetScopes.category.label}</option>
              <option value="brand">{copy.targetScopes.brand.label}</option>
              <option value="product_type">{copy.targetScopes.product_type.label}</option>
              <option value="product_id">{copy.targetScopes.product_id.label}</option>
            </select>
            <Hint>{copy.offers.scopeHint}</Hint>
          </div>

          {showBrandPicker ? (
            <SelectionField
              label={copy.offers.brands}
              buttonLabel={copy.offers.selectBrands}
              items={draft.allowed_brands.map((brand) => ({ key: brand, label: brand }))}
              emptyLabel={copy.offers.brandsEmpty}
              onOpen={() => setSelectorKind('brands')}
              onRemove={(brand) => update('allowed_brands', removeBrand(draft.allowed_brands, brand))}
              hint={copy.offers.brandHint}
            />
          ) : null}

          {showProductIdsPicker ? (
            <SelectionField
              label={copy.offers.products}
              buttonLabel={copy.offers.selectProducts}
              items={draft.allowed_product_ids.map((productId) => ({ key: String(productId), label: `ID ${productId}` }))}
              emptyLabel={copy.offers.productsEmpty}
              onOpen={() => setSelectorKind('products')}
              onRemove={(productId) =>
                update(
                  'allowed_product_ids',
                  draft.allowed_product_ids.filter((item) => item !== Number(productId)),
                )
              }
              hint={copy.offers.productsHint}
            />
          ) : null}

          {showCategoryPicker ? (
            <div>
              <label className="text-xs text-gray-500 font-medium">{copy.offers.categories}</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <label key={option.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowed_categories.includes(option.value)}
                      onChange={() => toggleCat(option.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {showProductTypePicker ? (
            <div>
              <label className="text-xs text-gray-500 font-medium">{copy.offers.productTypes}</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {productTypeOptions.map((option) => (
                  <label key={option.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowed_product_types.includes(option.value)}
                      onChange={() => togglePT(option.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">{copy.offers.estimatedCost}</label>
              <input
                type="number"
                value={draft.estimated_cost}
                onChange={(e) => update('estimated_cost', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>{copy.offers.estimatedCostHint}</Hint>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">{copy.offers.cooldown}</label>
              <input
                type="number"
                value={draft.cooldown_days}
                onChange={(e) => update('cooldown_days', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>{copy.offers.cooldownHint}</Hint>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">{copy.offers.expires}</label>
              <input
                type="number"
                value={draft.expires_in_days}
                onChange={(e) => update('expires_in_days', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>{copy.offers.expiresHint}</Hint>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">{copy.offers.minSpend90d}</label>
            <input
              type="number"
              value={draft.min_total_spend_90d}
              onChange={(e) => update('min_total_spend_90d', e.target.value)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
            />
            <Hint>{copy.offers.minSpend90dHint}</Hint>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
              className="w-4 h-4 rounded accent-gray-900"
            />
            <span>{copy.offers.active}</span>
          </label>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            {copy.common.cancel}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? copy.common.saving : copy.common.save}
          </button>
        </div>
      </div>

      {selectorKind ? (
        <SelectionPickerModal
          kind={selectorKind}
          selectedBrands={draft.allowed_brands}
          selectedProductIds={draft.allowed_product_ids}
          onApplyBrands={(brands) => update('allowed_brands', brands)}
          onApplyProductIds={(productIds) => update('allowed_product_ids', productIds)}
          onClose={() => setSelectorKind(null)}
        />
      ) : null}
    </div>
  );
}
