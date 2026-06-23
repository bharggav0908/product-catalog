import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { PageLoader, SkeletonCard, Spinner } from '../components/Spinner';
import type { Product, PaginatedResponse } from '../types';

const PAGE_SIZE = 20;

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextCursorEncoded, setNextCursorEncoded] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | undefined>(undefined);

  const categoryRef = useRef(category);
  categoryRef.current = category;

  const fetchProducts = useCallback(async (cursor?: string, cat?: string, append = false) => {
    const isFirst = !append;
    if (isFirst) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const response: PaginatedResponse = await api.getProducts({
        limit: PAGE_SIZE,
        cursor,
        category: cat,
      });

      setProducts((prev) => append ? [...prev, ...response.items] : response.items);
      setNextCursorEncoded(response.nextCursorEncoded ?? null);
      setHasMore(response.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchProducts(undefined, category, false);
  }, [category, fetchProducts]);

  const handleCategoryChange = useCallback((newCategory?: string) => {
    setCategory(newCategory);
    setProducts([]);
    setNextCursorEncoded(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!nextCursorEncoded || isLoadingMore) return;
    void fetchProducts(nextCursorEncoded, category, true);
  }, [nextCursorEncoded, isLoadingMore, fetchProducts, category]);

  return (
    <div className="min-h-screen bg-surface-900">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-surface-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gradient">Product Catalog</h1>
            <p className="text-slate-500 text-xs mt-0.5">200,000+ products · Cursor pagination</p>
          </div>
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs"
            id="api-docs-link"
          >
            📄 API Docs
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Hero ───────────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            Browse the Catalog
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            200,000+ products — filtered by category, sorted newest first,
            paginated with keyset cursors for{' '}
            <span className="text-brand-400 font-semibold">zero drift</span>.
          </p>
        </div>

        {/* ─── Category Filter ─────────────────────────────────────────── */}
        <section className="mb-8" aria-label="Category filters">
          <CategoryFilter selected={category} onChange={handleCategoryChange} />
        </section>

        {/* ─── Product Grid ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 font-medium text-lg mb-2">Failed to load products</p>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button
              className="btn-primary"
              onClick={() => void fetchProducts(undefined, category, false)}
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-300 font-medium text-lg">No products found</p>
            {category && (
              <p className="text-slate-500 text-sm mt-2">
                No products in category &quot;{category}&quot;
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Products grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              id="product-grid"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Stats bar */}
            <div className="mt-6 text-center text-slate-500 text-sm">
              Showing <span className="text-slate-300 font-semibold">{products.length}</span> products
              {category && (
                <> in <span className="text-brand-400 font-medium">{category}</span></>
              )}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  id="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="btn-primary min-w-[180px]"
                >
                  {isLoadingMore ? (
                    <>
                      <Spinner size="sm" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      Load More
                      <span className="text-brand-200">↓</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <div className="mt-8 text-center text-slate-500 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="h-px w-12 bg-slate-700" />
                  You&apos;ve reached the end
                  <span className="h-px w-12 bg-slate-700" />
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
