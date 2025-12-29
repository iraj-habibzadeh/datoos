'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { formatAddress } from '@/lib/utils';
import WalletModal from './WalletModal';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Close modal when wallet connects successfully
  React.useEffect(() => {
    if (isConnected && showModal) {
      setShowModal(false);
    }
  }, [isConnected, showModal]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 green-mode:bg-green-600 green-mode:hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          disabled
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <>
        <div className="relative wallet-menu-container">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 green-mode:bg-green-600 green-mode:hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            <span className="h-2 w-2 bg-green-400 rounded-full inline-block"></span>
            {formatAddress(address)}
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 green-mode:bg-green-50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 green-mode:border-green-200 z-50">
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 green-mode:text-green-800 border-b border-gray-200 dark:border-gray-700 green-mode:border-green-200">
                  {formatAddress(address)}
                </div>
                <button
                  onClick={() => {
                    disconnect();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 green-mode:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-700 green-mode:hover:bg-green-100 rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 green-mode:bg-green-600 green-mode:hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
      >
        Connect Wallet
      </button>
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

