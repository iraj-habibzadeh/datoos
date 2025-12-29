# Crypto Exchange Dashboard - Next.js 14

A modern cryptocurrency and exchange dashboard built with Next.js 14, featuring real-time API data and offline support via IndexedDB.

## Features

- 🚀 **Next.js 14** with App Router
- 💾 **IndexedDB** integration using `idb` package for offline data storage
- 📊 **Real-time API** integration with CoinGecko
- 🎨 **Tailwind CSS** for modern, responsive UI
- 🌙 **Dark mode** support
- ⚡ **Client-side caching** for instant data display
- 🔄 **Auto-sync** every 5 minutes
- 🔗 **Wallet Connect** integration with wagmi
- ❤️ **Like/Favorite** cryptocurrencies
- 👤 **Profile Page** to view liked coins

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: IndexedDB (via `idb` package)
- **API**: CoinGecko API
- **Web3**: wagmi, viem
- **State Management**: @tanstack/react-query

## Getting Started

### Installation

```bash
npm install
```

### Wallet Connect Setup

1. Get a WalletConnect Project ID from [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```
3. The app will work without a project ID, but WalletConnect functionality will be limited.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page component
│   └── globals.css     # Global styles
├── components/
│   ├── CryptoTable.tsx     # Cryptocurrency table component
│   └── ExchangeTable.tsx   # Exchange table component
├── hooks/
│   └── useCryptoSync.ts    # Custom hook for syncing API data with IndexedDB
├── lib/
│   ├── api.ts             # API service functions
│   └── indexedDB.ts       # IndexedDB utilities
└── types/
    └── crypto.ts          # TypeScript type definitions
```

## How It Works

1. **Data Fetching**: The app fetches data from CoinGecko API
2. **IndexedDB Storage**: Data is stored in IndexedDB for offline access
3. **Caching Strategy**: On load, cached data is displayed immediately, then fresh data is fetched
4. **Auto-sync**: Data is automatically refreshed every 5 minutes
5. **Offline Support**: If API fails, cached data from IndexedDB is displayed

## API Endpoints Used

- Cryptocurrencies: `https://api.coingecko.com/api/v3/coins/markets`
- Exchanges: `https://api.coingecko.com/api/v3/exchanges`

## License

MIT
