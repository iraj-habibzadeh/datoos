'use client';

import React, { useEffect } from 'react';
import { useConnect } from 'wagmi';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending, error } = useConnect();

  // Close modal on Escape key and prevent body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConnect = (connector: any) => {
    try {
      connect({ connector });
      // Don't close immediately - wait for connection to complete
      // The modal will close when isConnected becomes true
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const getWalletIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('metamask') || lowerName.includes('injected')) {
      return '🦊';
    }
    if (lowerName.includes('coinbase')) {
      return '🔵';
    }
    if (lowerName.includes('walletconnect')) {
      return '🔷';
    }
    return '💼';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 green-mode:bg-opacity-40 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white dark:bg-gray-800 green-mode:bg-green-50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 green-mode:border-green-200 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 green-mode:border-green-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white green-mode:text-green-900">
              Connect Wallet
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 green-mode:hover:text-green-600 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 green-mode:text-green-700 mb-4">
              Choose a wallet to connect to your account
            </p>
            
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 green-mode:border-green-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 green-mode:hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-3xl">{getWalletIcon(connector.name)}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white green-mode:text-green-900">
                      {connector.name}
                    </div>
                    {connector.type === 'injected' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 green-mode:text-green-600">
                        Browser extension
                      </div>
                    )}
                    {connector.type === 'walletConnect' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 green-mode:text-green-600">
                        Mobile & Desktop
                      </div>
                    )}
                    {connector.type === 'coinbaseWalletSDK' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 green-mode:text-green-600">
                        Coinbase Wallet
                      </div>
                    )}
                  </div>
                  {isPending && (
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {connectors.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 green-mode:text-green-600">
                No wallets available
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 green-mode:bg-red-50 border border-red-200 dark:border-red-800 green-mode:border-red-200 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 green-mode:text-red-700">
                  {error.message || 'Failed to connect wallet. Please try again.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 green-mode:border-green-200 bg-gray-50 dark:bg-gray-900 green-mode:bg-green-100 rounded-b-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 green-mode:text-green-600 text-center">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

