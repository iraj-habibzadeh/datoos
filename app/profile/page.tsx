'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getLikedCoins, isCoinLiked } from '@/lib/indexedDB';
import { getCryptocurrencies } from '@/lib/indexedDB';
import { CryptoCurrency } from '@/types/crypto';
import CryptoTable from '@/components/CryptoTable';
import Link from 'next/link';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [likedCoins, setLikedCoins] = useState<CryptoCurrency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedCoins = async () => {
      try {
        setLoading(true);
        const [likedCoinIds, allCryptos] = await Promise.all([
          getLikedCoins().catch(() => []),
          getCryptocurrencies().catch(() => []),
        ]);
        
        // Filter to only show liked coins
        const liked = allCryptos.filter((crypto: CryptoCurrency) =>
          likedCoinIds.includes(crypto.id)
        );
        
        setLikedCoins(liked);
      } catch (error) {
        // Don't log to console - handled gracefully, logged to debug system
        setLikedCoins([]);
      } finally {
        setLoading(false);
      }
    };

    loadLikedCoins();
  }, []);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 green-mode:bg-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 green-mode:bg-green-100 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white green-mode:text-green-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 green-mode:text-green-700 mb-6">
              Please connect your wallet to view your liked coins.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 green-mode:bg-green-600 green-mode:hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 green-mode:bg-green-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white green-mode:text-green-900 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 green-mode:text-green-700">
            Your liked cryptocurrencies
          </p>
          {address && (
            <p className="text-sm text-gray-500 dark:text-gray-500 green-mode:text-green-600 mt-2">
              Wallet: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 green-mode:bg-green-100 rounded-lg shadow-md p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 green-mode:bg-green-200 rounded"></div>
              ))}
            </div>
          ) : likedCoins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 green-mode:text-green-600 mb-4">
                You haven&apos;t liked any coins yet.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 green-mode:bg-green-600 green-mode:hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Browse Cryptocurrencies
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 green-mode:text-green-700">
                Showing {likedCoins.length} liked {likedCoins.length === 1 ? 'coin' : 'coins'}
              </div>
              <CryptoTable data={likedCoins} loading={false} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

