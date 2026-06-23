import { useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';
import type { Product, PaginatedResponse } from '../types';

interface UseProductsState {
  products: Product[];
  nextCursorEncoded: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
}

interface UseProductsReturn extends UseProductsState {
  loadMore: () => void;
  refetch: (category?: string) => void;
}

const PAGE_SIZE = 20;

export function useProducts(initialCategory?: string): UseProductsReturn {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    nextCursorEncoded: null,
    isLoading: true,
    isLoadingMore: false,
    error: null,
    hasMore: false,
  });

  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [cursorToLoad, setCursorToLoad] = useState<string | undefined>(undefined);
  const [appendMode, setAppendMode] = useState(false);

  const fetchProducts = useCallback(
    async (cursor?: string, cat?: string, append = false) => {
      const isFirst = !append;
      setState((prev) => ({
        ...prev,
        isLoading: isFirst,
        isLoadingMore: !isFirst,
        error: null,
      }));

      try {
        const response: PaginatedResponse = await api.getProducts({
          limit: PAGE_SIZE,
          cursor,
          category: cat,
        });

        setState((prev) => ({
          ...prev,
          products: append ? [...prev.products, ...response.items] : response.items,
          nextCursorEncoded: response.nextCursorEncoded ?? null,
          hasMore: response.nextCursor !== null,
          isLoading: false,
          isLoadingMore: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load products',
          isLoading: false,
          isLoadingMore: false,
        }));
      }
    },
    [],
  );

  // Trigger fetch when category changes or on mount
  useEffect(() => {
    void fetchProducts(undefined, category, false);
  }, [category, fetchProducts]);

  // Load more when cursor changes
  useEffect(() => {
    if (cursorToLoad) {
      void fetchProducts(cursorToLoad, category, appendMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorToLoad]);

  const refetch = useCallback((newCategory?: string) => {
    setCategory(newCategory);
    setState((prev) => ({ ...prev, products: [], nextCursorEncoded: null }));
  }, []);

  const loadMore = useCallback(() => {
    if (!state.nextCursorEncoded || state.isLoadingMore) return;
    setAppendMode(true);
    setCursorToLoad(state.nextCursorEncoded);
  }, [state.nextCursorEncoded, state.isLoadingMore]);

  return { ...state, loadMore, refetch };
}
