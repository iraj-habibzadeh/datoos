import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CryptoCurrency, ExchangeData } from '@/types/crypto';

interface CryptoDB extends DBSchema {
  cryptocurrencies: {
    key: string;
    value: {
      id: string;
      data: any;
      lastUpdated: number;
    };
    indexes: {
      lastUpdated: number;
    };
  };
  exchanges: {
    key: string;
    value: {
      id: string;
      data: any;
      lastUpdated: number;
    };
    indexes: {
      lastUpdated: number;
    };
  };
  likedCoins: {
    key: string;
    value: {
      id: string;
      coinId: string;
      timestamp: number;
    };
    indexes: {
      timestamp: number;
    };
  };
}

const DB_NAME = 'crypto-exchange-db';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<CryptoDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<CryptoDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB<CryptoDB>(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase<CryptoDB>, oldVersion, newVersion, transaction) {
        // Create object store for cryptocurrencies
        if (!db.objectStoreNames.contains('cryptocurrencies')) {
          const cryptoStore = db.createObjectStore('cryptocurrencies', {
            keyPath: 'id',
          });
          cryptoStore.createIndex('lastUpdated', 'lastUpdated');
        }

        // Create object store for exchanges
        if (!db.objectStoreNames.contains('exchanges')) {
          const exchangeStore = db.createObjectStore('exchanges', {
            keyPath: 'id',
          });
          exchangeStore.createIndex('lastUpdated', 'lastUpdated');
        }

        // Create object store for liked coins
        if (!db.objectStoreNames.contains('likedCoins')) {
          const likedStore = db.createObjectStore('likedCoins', {
            keyPath: 'id',
          });
          likedStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  } catch (error) {
    throw error;
  }

  return dbInstance;
}

export async function saveCryptocurrencies(data: CryptoCurrency[]): Promise<void> {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }
  const db = await getDB();
  const tx = db.transaction('cryptocurrencies', 'readwrite');
  
  for (const item of data) {
    await tx.store.put({
      id: item.id,
      data: item,
      lastUpdated: Date.now(),
    });
  }
  
  await tx.done;
}

export async function getCryptocurrencies(): Promise<CryptoCurrency[]> {
  try {
    const db = await getDB();
    const allRecords = await db.getAll('cryptocurrencies');
    return allRecords.map((record: { id: string; data: CryptoCurrency; lastUpdated: number }) => record.data);
  } catch (error) {
    return [];
  }
}

export async function saveExchanges(data: ExchangeData[]): Promise<void> {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }
  const db = await getDB();
  const tx = db.transaction('exchanges', 'readwrite');
  
  for (const item of data) {
    await tx.store.put({
      id: item.id,
      data: item,
      lastUpdated: Date.now(),
    });
  }
  
  await tx.done;
}

export async function getExchanges(): Promise<ExchangeData[]> {
  try {
    const db = await getDB();
    const allRecords = await db.getAll('exchanges');
    return allRecords.map((record: { id: string; data: ExchangeData; lastUpdated: number }) => record.data);
  } catch (error) {
    // Don't log to console - handled gracefully with empty array fallback
    return [];
  }
}

export async function clearDatabase(): Promise<void> {
  const db = await getDB();
  await db.clear('cryptocurrencies');
  await db.clear('exchanges');
}

export async function toggleLikeCoin(coinId: string): Promise<boolean> {
  try {
    const db = await getDB();
    const existing = await db.get('likedCoins', coinId);
    
    if (existing) {
      await db.delete('likedCoins', coinId);
      return false; // Unliked
    } else {
      await db.put('likedCoins', {
        id: coinId,
        coinId,
        timestamp: Date.now(),
      });
      return true; // Liked
    }
  } catch (error) {
    // Don't log to console - handled gracefully with false fallback
    return false;
  }
}

export async function isCoinLiked(coinId: string): Promise<boolean> {
  try {
    const db = await getDB();
    const liked = await db.get('likedCoins', coinId);
    return !!liked;
  } catch (error) {
    return false;
  }
}

export async function getLikedCoins(): Promise<string[]> {
  try {
    const db = await getDB();
    const allLiked = await db.getAll('likedCoins');
    return allLiked.map((item) => item.coinId);
  } catch (error) {
    return [];
  }
}

export async function getLikedCoinsSet(): Promise<Set<string>> {
  const likedIds = await getLikedCoins();
  return new Set(likedIds);
}

