'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCryptocurrencies, fetchExchanges, fetchTotalCryptocurrenciesCount } from '@/lib/api';
import {
  saveCryptocurrencies,
  getCryptocurrencies,
  saveExchanges,
  getExchanges,
} from '@/lib/indexedDB';
import { CryptoCurrency, ExchangeData } from '@/types/crypto';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ITEMS_PER_PAGE = 50;

export function useCryptoSync() {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const initRef = useRef(false); // Prevent multiple simultaneous initializations

  const syncData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first unless forced refresh
      if (!forceRefresh && lastSync) {
        const cacheAge = Date.now() - lastSync.getTime();
        if (cacheAge < CACHE_DURATION) {
          // Cache is still fresh, load from cache only
          const [cachedCryptos, cachedExchanges] = await Promise.all([
            getCryptocurrencies(),
            getExchanges(),
          ]);
          if (cachedCryptos.length > 0) {
            setCryptos(cachedCryptos);
            const hasMoreData = cachedCryptos.length === ITEMS_PER_PAGE;
            setHasMore(hasMoreData);
            setTotalPages(hasMoreData ? Math.ceil(cachedCryptos.length / ITEMS_PER_PAGE) + 1 : Math.ceil(cachedCryptos.length / ITEMS_PER_PAGE));
          }
          if (cachedExchanges.length > 0) {
            setExchanges(cachedExchanges);
          }
          setLoading(false);
          return;
        }
      }

      // Cache expired or forced refresh - fetch from API
      const [cryptoData, exchangeData] = await Promise.all([
        fetchCryptocurrencies(1, ITEMS_PER_PAGE),
        fetchExchanges(1, ITEMS_PER_PAGE),
      ]);

      if (Array.isArray(cryptoData) && cryptoData.length > 0) {
        await saveCryptocurrencies(cryptoData);
        setCryptos(cryptoData);
        const hasMoreData = cryptoData.length === ITEMS_PER_PAGE;
        setHasMore(hasMoreData);
        setCurrentPage(1);
        setTotalPages(hasMoreData ? 2 : 1);
      } else {
        setHasMore(false);
        setTotalPages(1);
      }

      if (Array.isArray(exchangeData) && exchangeData.length > 0) {
        await saveExchanges(exchangeData);
        setExchanges(exchangeData);
      }

      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');

      // Try to load from IndexedDB as fallback
      try {
        const [cachedCryptos, cachedExchanges] = await Promise.all([
          getCryptocurrencies(),
          getExchanges(),
        ]);
        if (cachedCryptos.length > 0) setCryptos(cachedCryptos);
        if (cachedExchanges.length > 0) setExchanges(cachedExchanges);
      } catch (dbError) {
        // Silently handle fallback errors
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromCache = useCallback(async () => {
    try {
      setLoading(true);
      const [cachedCryptos, cachedExchanges] = await Promise.all([
        getCryptocurrencies(),
        getExchanges(),
      ]);

      if (cachedCryptos.length > 0) {
        setCryptos(cachedCryptos);
        const hasMoreData = cachedCryptos.length === ITEMS_PER_PAGE;
        setHasMore(hasMoreData);
        const estimatedPages = Math.ceil(cachedCryptos.length / ITEMS_PER_PAGE);
        setTotalPages(hasMoreData ? estimatedPages + 1 : estimatedPages);
      } else {
        setHasMore(true);
        setTotalPages(1);
      }

      if (cachedExchanges.length > 0) {
        setExchanges(cachedExchanges);
      }
    } catch (err) {
      // Silently handle cache load errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent multiple simultaneous initializations (React Strict Mode in dev)
    if (initRef.current) {
      return;
    }
    initRef.current = true;
    
    // Optimized initialization: load cache first (fast), then sync in background
    const initialize = async () => {
      // Step 1: Load from cache immediately (fast, no network)
      await loadFromCache();
      
      // Step 2: Fetch total count in background (non-blocking)
      const fetchTotalCount = async () => {
        try {
          const count = await fetchTotalCryptocurrenciesCount();
          setTotalCount(count);
          setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        } catch (err) {
          // Silently handle errors
        }
      };
      fetchTotalCount();
      
      // Step 3: Sync data in background (only if cache is stale)
      syncData(false); // Pass false to check cache first
    };
    
    initialize();

    const interval = setInterval(syncData, CACHE_DURATION);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncData, loadFromCache]);

  const loadMoreCryptos = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const nextPage = currentPage + 1;
      const newCryptoData = await fetchCryptocurrencies(nextPage, ITEMS_PER_PAGE);

      if (Array.isArray(newCryptoData) && newCryptoData.length > 0) {
        await saveCryptocurrencies(newCryptoData);

        setCryptos((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newItems = newCryptoData.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newItems];
        });

        setCurrentPage(nextPage);
        const hasMoreData = newCryptoData.length === ITEMS_PER_PAGE;
        setHasMore(hasMoreData);
        setTotalPages((prev) => (hasMoreData ? Math.max(prev, nextPage + 1) : nextPage));
      } else if (Array.isArray(newCryptoData) && newCryptoData.length === 0) {
        setHasMore(false);
      } else {
        setError('Invalid response from API. Please try again.');
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more data. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page === currentPage || loadingMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const pageData = await fetchCryptocurrencies(page, ITEMS_PER_PAGE);

      if (Array.isArray(pageData) && pageData.length > 0) {
        await saveCryptocurrencies(pageData);
        setCryptos(pageData);

        const hasMoreData = pageData.length === ITEMS_PER_PAGE;
        setHasMore(hasMoreData);
        setCurrentPage(page);

        setTotalPages((prev) => (hasMoreData ? Math.max(prev, page + 1) : page));
      } else if (Array.isArray(pageData) && pageData.length === 0) {
        setHasMore(false);
        setTotalPages(page - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore]);

  return {
    cryptos,
    exchanges,
    loading,
    loadingMore,
    error,
    lastSync,
    hasMore,
    currentPage,
    totalPages,
    totalCount,
    refresh: () => syncData(true), // Force refresh
    loadMore: loadMoreCryptos,
    goToPage,
  };
}
