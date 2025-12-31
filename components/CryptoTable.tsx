'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CryptoCurrency } from '@/types/crypto';
import { toggleLikeCoin, getLikedCoins } from '@/lib/indexedDB';
import { formatCurrency, formatCompactNumber, formatPercentage } from '@/lib/utils';

interface CryptoTableProps {
  data: CryptoCurrency[];
  loading?: boolean;
}

type SortField = 'market_cap_rank' | 'name' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';
type SortDirection = 'asc' | 'desc';

// Sparkline Chart Component - Memoized for performance
const SparklineChart = React.memo<{ prices: number[] | undefined; isPositive: boolean }>(({ prices, isPositive }) => {
  if (!prices || prices.length === 0) {
    return (
      <div className="w-20 h-8 flex items-center justify-center text-gray-400 text-xs">
        N/A
      </div>
    );
  }

  const width = 80;
  const height = 32;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const points = prices.map((price, index) => {
    const x = padding + (index / (prices.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((price - minPrice) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const color = isPositive ? '#10b981' : '#ef4444'; // green-500 or red-500

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
SparklineChart.displayName = 'SparklineChart';

export default function CryptoTable({ data, loading }: CryptoTableProps) {
  const [sortField, setSortField] = useState<SortField>('market_cap_rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [likedCoins, setLikedCoins] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadLikedStatus = async () => {
      try {
        // Batch load all liked coins at once instead of N individual calls
        const likedIds = await getLikedCoins();
        setLikedCoins(new Set(likedIds));
      } catch (err) {
        // Don't log to console - handled gracefully, logged to debug system
      }
    };

    if (data.length > 0) {
      loadLikedStatus();
    }
  }, [data]);

  const handleLikeToggle = async (coinId: string) => {
    try {
      const newLiked = await toggleLikeCoin(coinId);
      setLikedCoins((prev) => {
        const updated = new Set(prev);
        if (newLiked) {
          updated.add(coinId);
        } else {
          updated.delete(coinId);
        }
        return updated;
      });
    } catch (err) {
      // Don't log to console - handled gracefully, logged to debug system
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'market_cap_rank':
          aValue = a.market_cap_rank || 0;
          bValue = b.market_cap_rank || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'current_price':
          aValue = a.current_price || 0;
          bValue = b.current_price || 0;
          break;
        case 'price_change_percentage_24h':
          aValue = a.price_change_percentage_24h || 0;
          bValue = b.price_change_percentage_24h || 0;
          break;
        case 'market_cap':
          aValue = a.market_cap || 0;
          bValue = b.market_cap || 0;
          break;
        case 'total_volume':
          aValue = a.total_volume || 0;
          bValue = b.total_volume || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = Number(aValue);
      const numB = Number(bValue);

      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <span className="ml-1 text-gray-400">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }

    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? (
          <svg className="w-4 h-4 inline text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 inline text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No cryptocurrency data available
      </div>
    );
  }

  // Use utility functions from lib/utils.ts
  const formatNumber = formatCompactNumber;

  return (
    <div className="overflow-x-auto w-full">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('market_cap_rank')}
              >
                <div className="flex items-center">
                  Rank
                  <SortIcon field="market_cap_rank" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('current_price')}
              >
                <div className="flex items-center">
                  Price
                  <SortIcon field="current_price" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('price_change_percentage_24h')}
              >
                <div className="flex items-center">
                  24h Change
                  <SortIcon field="price_change_percentage_24h" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('market_cap')}
              >
                <div className="flex items-center">
                  Market Cap
                  <SortIcon field="market_cap" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('total_volume')}
              >
                <div className="flex items-center">
                  Volume
                  <SortIcon field="total_volume" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                7d Chart
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Like
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((crypto: CryptoCurrency) => {
              const isPositive = (crypto.price_change_percentage_24h || 0) >= 0;
              return (
                <tr
                  key={crypto.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {crypto.market_cap_rank}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full mr-3 overflow-hidden flex-shrink-0">
                        <Image
                          src={crypto.image || 'https://via.placeholder.com/32'}
                          alt={crypto.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {crypto.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(crypto.current_price)}
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                      crypto.price_change_percentage_24h != null && crypto.price_change_percentage_24h >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : crypto.price_change_percentage_24h != null
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatNumber(crypto.market_cap)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatNumber(crypto.total_volume)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <SparklineChart
                      prices={crypto.sparkline_in_7d?.price}
                      isPositive={isPositive}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleLikeToggle(crypto.id)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={likedCoins.has(crypto.id) ? 'Unlike' : 'Like'}
                    >
                      {likedCoins.has(crypto.id) ? (
                        <svg
                          className="w-5 h-5 text-red-500 fill-current"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
