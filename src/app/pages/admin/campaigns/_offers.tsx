import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Offer, OfferType, TargetScope } from '../../../../shared/api/adminOffers';
import {
  CATEGORY_OPTIONS,
  OFFER_TYPE_LABEL,
  STEP_OPTIONS,
  TARGET_SCOPE_LABEL,
  asArrayOfNumbers,
  asArrayOfStrings,
  removeBrand,
  toggleArrayValue,
  type PickerKind,
} from './_helpers';
import { Hint, SelectionField, SelectionPickerModal } from './_components';

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
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="font-semibold text-gray-900">Офферы</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Каждый оффер — конкретная скидка/бонус с собственным таргетингом. Пользователю выдаётся <b>один</b> из них.
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          Добавить оффер
        </button>
      </div>

      {disabled ? (
        <div className="mt-4 text-sm text-gray-500 italic">{disabledHint ?? 'Сохраните кампанию, чтобы добавить офферы.'}</div>
      ) : offers.length === 0 ? (
        <div className="mt-4 text-sm text-gray-500 italic">Офферов пока нет.</div>
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="py-2 font-medium">Название</th>
                <th className="py-2 font-medium">Тип</th>
                <th className="py-2 font-medium">Значение</th>
                <th className="py-2 font-medium">Куда</th>
                <th className="py-2 font-medium">Est. cost</th>
                <th className="py-2 font-medium">Статус</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-900">{offer.name}</td>
                  <td className="py-2.5 text-gray-700">{OFFER_TYPE_LABEL[offer.offer_type]}</td>
                  <td className="py-2.5 text-gray-700">
                    {offer.offer_type === 'discount'
                      ? `${offer.value}%`
                      : offer.offer_type === 'points_multiplier'
                        ? `×${offer.value}`
                        : String(offer.value)}
                  </td>
                  <td className="py-2.5 text-gray-700">{TARGET_SCOPE_LABEL[offer.target_scope]}</td>
                  <td className="py-2.5 text-gray-700">{offer.estimated_cost} ₸</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${
                        offer.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {offer.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => onEdit(offer)}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Редактировать"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(offer)}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
                        title="Удалить"
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
          <h3 className="font-semibold text-gray-900">{draft.id ? 'Редактировать оффер' : 'Новый оффер'}</h3>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">Название</label>
            <input
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="например, 10% на парфюм"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Тип</label>
              <select
                value={draft.offer_type}
                onChange={(e) => update('offer_type', e.target.value as OfferType)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="discount">Скидка (%)</option>
                <option value="points_multiplier">Множитель баллов (×N)</option>
                <option value="gift">Подарок</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {draft.offer_type === 'discount' ? 'Процент скидки' : draft.offer_type === 'points_multiplier' ? 'Множитель' : 'Значение'}
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
            <label className="text-xs text-gray-500 font-medium">На что применяется (scope)</label>
            <select
              value={draft.target_scope}
              onChange={(e) => update('target_scope', e.target.value as TargetScope)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="cart">На всю корзину</option>
              <option value="category">На категорию</option>
              <option value="brand">На бренд</option>
              <option value="product_type">На тип товара</option>
              <option value="product_id">На конкретные товары</option>
            </select>
            <Hint>Scope определяет, как скидка применяется в чекауте. Для brand/product_id укажите бренды или ID товаров ниже.</Hint>
          </div>

          {showBrandPicker ? (
            <SelectionField
              label="Бренды"
              buttonLabel="Выбрать бренды"
              items={draft.allowed_brands.map((brand) => ({ key: brand, label: brand }))}
              emptyLabel="Бренды не выбраны"
              onOpen={() => setSelectorKind('brands')}
              onRemove={(brand) => update('allowed_brands', removeBrand(draft.allowed_brands, brand))}
              hint="Для scope «На бренд» выберите хотя бы один бренд."
            />
          ) : null}

          {showProductIdsPicker ? (
            <SelectionField
              label="Товары"
              buttonLabel="Выбрать товары"
              items={draft.allowed_product_ids.map((productId) => ({ key: String(productId), label: `ID ${productId}` }))}
              emptyLabel="Товары не выбраны"
              onOpen={() => setSelectorKind('products')}
              onRemove={(productId) =>
                update(
                  'allowed_product_ids',
                  draft.allowed_product_ids.filter((item) => item !== Number(productId)),
                )
              }
              hint="Если оставить пустым, система сможет подобрать товар по категории/типу."
            />
          ) : null}

          {showCategoryPicker ? (
            <div>
              <label className="text-xs text-gray-500 font-medium">Разрешённые категории</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowed_categories.includes(o.value)}
                      onChange={() => toggleCat(o.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {showProductTypePicker ? (
            <div>
              <label className="text-xs text-gray-500 font-medium">Разрешённые типы товаров</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {STEP_OPTIONS.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowed_product_types.includes(o.value)}
                      onChange={() => togglePT(o.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Est. cost (₸)</label>
              <input
                type="number"
                value={draft.estimated_cost}
                onChange={(e) => update('estimated_cost', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>Сколько списывается из бюджета кампании при выдаче.</Hint>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Cooldown (дней)</label>
              <input
                type="number"
                value={draft.cooldown_days}
                onChange={(e) => update('cooldown_days', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>Не выдавать тот же оффер этому пользователю N дней после погашения.</Hint>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Срок жизни (дней)</label>
              <input
                type="number"
                value={draft.expires_in_days}
                onChange={(e) => update('expires_in_days', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>Через сколько дней назначение сгорит, если не погашено.</Hint>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">Мин. сумма покупок за 90 дней (₸)</label>
            <input
              type="number"
              value={draft.min_total_spend_90d}
              onChange={(e) => update('min_total_spend_90d', e.target.value)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
            />
            <Hint>Оффер увидят только пользователи с суммой покупок за последние 90 дней не ниже этого порога.</Hint>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
              className="w-4 h-4 rounded accent-gray-900"
            />
            <span>Активен</span>
          </label>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Сохраняю…' : 'Сохранить'}
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
