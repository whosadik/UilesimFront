import { createContext, useContext, useEffect, useState } from 'react';
import { ApiError } from '../api/ApiError';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../api/cart';
import { addToWishlist, getWishlist, removeFromWishlist } from '../api/wishlist';
import { useAuth } from '../auth/AuthContext';

type CartQuantities = Record<string, number>;

interface CommerceContextValue {
  wishlistCount: number;
  cartCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  getCartQuantity: (productId: string | number) => number;
  toggleWishlist: (productId: string | number) => Promise<boolean>;
  addToCart: (productId: string | number, quantity?: number) => Promise<number>;
  setCartQuantity: (productId: string | number, quantity: number) => Promise<number>;
  removeFromCart: (productId: string | number) => Promise<void>;
}

const CommerceContext = createContext<CommerceContextValue | undefined>(undefined);

function normalizeId(productId: string | number): string {
  return String(productId);
}

function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

function sumCartQuantities(cartQuantities: CartQuantities): number {
  return Object.values(cartQuantities).reduce((total, quantity) => total + quantity, 0);
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());
  const [cartQuantities, setCartQuantities] = useState<CartQuantities>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setWishlistProductIds(new Set());
      setCartQuantities({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [wishlistResponse, cartResponse] = await Promise.all([getWishlist(), getCart()]);

      const nextWishlistIds = new Set<string>();
      for (const item of Array.isArray(wishlistResponse.items) ? wishlistResponse.items : []) {
        const productId =
          item &&
          typeof item === 'object' &&
          item.product &&
          typeof item.product === 'object' &&
          (typeof item.product.id === 'number' || typeof item.product.id === 'string')
            ? String(item.product.id)
            : null;
        if (productId) {
          nextWishlistIds.add(productId);
        }
      }

      const nextCartQuantities: CartQuantities = {};
      for (const item of Array.isArray(cartResponse.items) ? cartResponse.items : []) {
        const productId =
          item &&
          typeof item === 'object' &&
          item.product &&
          typeof item.product === 'object' &&
          (typeof item.product.id === 'number' || typeof item.product.id === 'string')
            ? String(item.product.id)
            : null;
        if (!productId) {
          continue;
        }
        const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity);
        nextCartQuantities[productId] = Number.isFinite(quantity) ? Math.max(0, Math.round(quantity)) : 0;
      }

      setWishlistProductIds(nextWishlistIds);
      setCartQuantities(nextCartQuantities);
    } catch (error) {
      if (isAuthError(error)) {
        setWishlistProductIds(new Set());
        setCartQuantities({});
        return;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (isAuthLoading) {
        return;
      }

      try {
        await refresh();
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, user?.id]);

  const toggleWishlist = async (productId: string | number) => {
    const normalizedId = normalizeId(productId);
    const alreadyInWishlist = wishlistProductIds.has(normalizedId);

    if (alreadyInWishlist) {
      await removeFromWishlist(normalizedId);
      setWishlistProductIds((current) => {
        const next = new Set(current);
        next.delete(normalizedId);
        return next;
      });
      return false;
    }

    await addToWishlist(normalizedId);
    setWishlistProductIds((current) => {
      const next = new Set(current);
      next.add(normalizedId);
      return next;
    });
    return true;
  };

  const addToCartAndSync = async (productId: string | number, quantity = 1) => {
    const normalizedId = normalizeId(productId);
    const response = await addCartItem(normalizedId, quantity);
    const item =
      response &&
      typeof response === 'object' &&
      response.item &&
      typeof response.item === 'object'
        ? (response.item as { quantity?: unknown })
        : null;
    const nextQuantity =
      item && typeof item.quantity === 'number'
        ? item.quantity
        : (cartQuantities[normalizedId] ?? 0) + Math.max(1, Math.round(quantity));

    setCartQuantities((current) => ({
      ...current,
      [normalizedId]: Math.max(0, Math.round(nextQuantity)),
    }));
    return Math.max(0, Math.round(nextQuantity));
  };

  const setCartQuantityAndSync = async (productId: string | number, quantity: number) => {
    const normalizedId = normalizeId(productId);
    const nextRequestedQuantity = Math.max(0, Math.round(quantity));

    if (nextRequestedQuantity <= 0) {
      await removeCartItem(normalizedId);
      setCartQuantities((current) => {
        const next = { ...current };
        delete next[normalizedId];
        return next;
      });
      return 0;
    }

    const response = await updateCartItem(normalizedId, nextRequestedQuantity);
    const item =
      response &&
      typeof response === 'object' &&
      response.item &&
      typeof response.item === 'object'
        ? (response.item as { quantity?: unknown })
        : null;
    const nextQuantity =
      item && typeof item.quantity === 'number' ? item.quantity : nextRequestedQuantity;

    setCartQuantities((current) => ({
      ...current,
      [normalizedId]: Math.max(0, Math.round(nextQuantity)),
    }));
    return Math.max(0, Math.round(nextQuantity));
  };

  const removeFromCartAndSync = async (productId: string | number) => {
    const normalizedId = normalizeId(productId);
    await removeCartItem(normalizedId);
    setCartQuantities((current) => {
      const next = { ...current };
      delete next[normalizedId];
      return next;
    });
  };

  return (
    <CommerceContext.Provider
      value={{
        wishlistCount: wishlistProductIds.size,
        cartCount: sumCartQuantities(cartQuantities),
        isLoading,
        refresh,
        isInWishlist: (productId) => wishlistProductIds.has(normalizeId(productId)),
        getCartQuantity: (productId) => cartQuantities[normalizeId(productId)] ?? 0,
        toggleWishlist,
        addToCart: addToCartAndSync,
        setCartQuantity: setCartQuantityAndSync,
        removeFromCart: removeFromCartAndSync,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce(): CommerceContextValue {
  const value = useContext(CommerceContext);
  if (!value) {
    throw new Error('useCommerce must be used within CommerceProvider');
  }
  return value;
}
