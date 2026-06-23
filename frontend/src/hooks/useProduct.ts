import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Product } from '../types';

interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

export function useProduct(id: string): UseProductReturn {
  const [state, setState] = useState<UseProductReturn>({
    product: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    setState({ product: null, isLoading: true, error: null });

    void api
      .getProduct(id)
      .then((product) => {
        if (!cancelled) {
          setState({ product, isLoading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            product: null,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load product',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
