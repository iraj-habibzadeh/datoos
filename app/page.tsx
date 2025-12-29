'use client';

import { useState } from 'react';
import { useCryptoSync } from '@/hooks/useCryptoSync';
import CryptoTable from '@/components/CryptoTable';
import ExchangeTable from '@/components/ExchangeTable';
import Pagination from '@/components/Pagination';

export default function Home() {
  const {
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
    refresh,
    loadMore,
    goToPage,
  } = useCryptoSync();
  const [activeTab, setActiveTab] = useState<'crypto' | 'exchange'>('crypto');

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 green-mode:bg-green-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white green-mode:text-green-900 mb-2">
            Crypto Exchange Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 green-mode:text-green-700">
            Real-time cryptocurrency and exchange data with offline support via IndexedDB
          </p>
        </div>

        {/* Status Bar */}
        <div className="bg-white dark:bg-gray-800 green-mode:bg-green-100 rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                  }`}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 green-mode:text-green-700">
                  {loading ? 'Syncing...' : 'Synced'}
                </span>
              </div>
              {lastSync && (
                <span className="text-sm text-gray-500 dark:text-gray-500 green-mode:text-green-600">
                  Last sync: {formatLastSync(lastSync)}
                </span>
              )}
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 green-mode:bg-green-600 green-mode:hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 green-mode:bg-red-50 border border-red-300 dark:border-red-700 green-mode:border-red-200 rounded text-red-700 dark:text-red-400 green-mode:text-red-600 text-sm">
              Error: {error}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700 green-mode:border-green-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('crypto')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'crypto'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 green-mode:border-green-600 green-mode:text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 green-mode:text-green-600 green-mode:hover:text-green-800 green-mode:hover:border-green-300'
                }`}
              >
                Cryptocurrencies ({cryptos.length})
              </button>
              <button
                onClick={() => setActiveTab('exchange')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'exchange'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 green-mode:border-green-600 green-mode:text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 green-mode:text-green-600 green-mode:hover:text-green-800 green-mode:hover:border-green-300'
                }`}
              >
                Exchanges ({exchanges.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 green-mode:bg-green-50 rounded-lg shadow-md p-6">
          {activeTab === 'crypto' ? (
            <>
              <CryptoTable data={cryptos} loading={loading} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                loading={loadingMore}
                hasMore={hasMore}
                currentCount={cryptos.length}
                totalCount={totalCount}
                initialLoading={loading}
              />
            </>
          ) : (
            <ExchangeTable data={exchanges} loading={loading} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 green-mode:text-green-600">
          <p>
            Data powered by{' '}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 green-mode:text-green-700 green-mode:hover:text-green-800"
            >
              CoinGecko API
            </a>
            {' '}• Data cached in IndexedDB for offline access
          </p>
        </div>
      </div>
    </main>
  );
}
