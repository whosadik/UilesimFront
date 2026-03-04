/**
 * Skeleton loading components for different sections
 * Used for loading states across the app
 */

import { ProductCardSkeleton } from "./ProductCard";

/**
 * Skeleton for recommendation section (header + 6 cards)
 */
export function RecommendationSectionSkeleton() {
  return (
    <div className="mb-12">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Next Offer card
 */
export function NextOfferCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-pink-100 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-3 mb-6">
        <div className="h-5 w-full bg-gray-200 rounded" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
      </div>

      {/* Timer */}
      <div className="h-10 w-full bg-gray-100 rounded-lg mb-4" />

      {/* Button */}
      <div className="h-12 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}

/**
 * Skeleton for Loyalty Widget
 */
export function LoyaltyWidgetSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 animate-pulse">
      {/* Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Points */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="h-8 w-40 bg-gray-200 rounded" />
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-100 rounded-full" />
        <div className="h-3 w-48 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Profile Summary
 */
export function ProfileSummarySkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-8 w-full bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for product gallery
 */
export function ProductGallerySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Main image */}
      <div className="aspect-square bg-gray-200 rounded-xl" />

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for product info section
 */
export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Brand + Title */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-8 w-full bg-gray-200 rounded" />
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-4">
        <div className="h-6 w-32 bg-gray-100 rounded" />
        <div className="h-6 w-24 bg-gray-100 rounded" />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="h-10 w-40 bg-gray-200 rounded" />
        <div className="h-5 w-32 bg-gray-100 rounded" />
      </div>

      {/* Loyalty */}
      <div className="h-16 w-full bg-gray-50 border border-gray-200 rounded-lg" />

      {/* Buttons */}
      <div className="space-y-3">
        <div className="h-12 w-full bg-gray-200 rounded-lg" />
        <div className="h-12 w-full bg-gray-100 rounded-lg" />
      </div>

      {/* Features */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-full bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for transaction list
 */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-gray-100 rounded" />
            <div className="h-8 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for carousel section
 */
export function CarouselSectionSkeleton() {
  return (
    <div className="mb-12 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-10 w-24 bg-gray-100 rounded-lg" />
      </div>

      {/* Carousel items */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-80 h-64 bg-gray-200 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Generic list item skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-8 bg-gray-100 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}
