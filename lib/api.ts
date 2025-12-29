import { CryptoCurrency, ExchangeData } from '@/types/crypto';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchTotalCryptocurrenciesCount(): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/list?include_platform=false`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch total count: ${response.statusText}`);
      return 10000;
    }

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error('Error fetching total count:', error);
    return 10000;
  }
}

export async function fetchCryptocurrencies(
  page: number = 1,
  perPage: number = 50
): Promise<CryptoCurrency[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&locale=en`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch cryptocurrencies: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return [];
  }
}

export async function fetchExchanges(
  page: number = 1,
  perPage: number = 50
): Promise<ExchangeData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/exchanges?per_page=${perPage}&page=${page}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch exchanges: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return [];
  }
}

export async function fetchCryptoById(id: string): Promise<CryptoCurrency | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch crypto: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large || data.image?.small || '',
      current_price: data.market_data?.current_price?.usd || 0,
      market_cap: data.market_data?.market_cap?.usd || 0,
      market_cap_rank: data.market_cap_rank || 0,
      total_volume: data.market_data?.total_volume?.usd || 0,
      high_24h: data.market_data?.high_24h?.usd || 0,
      low_24h: data.market_data?.low_24h?.usd || 0,
      price_change_24h: data.market_data?.price_change_24h || 0,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
      market_cap_change_24h: data.market_data?.market_cap_change_24h || 0,
      market_cap_change_percentage_24h: data.market_data?.market_cap_change_percentage_24h || 0,
      circulating_supply: data.market_data?.circulating_supply || 0,
      total_supply: data.market_data?.total_supply,
      max_supply: data.market_data?.max_supply,
      ath: data.market_data?.ath?.usd || 0,
      ath_change_percentage: data.market_data?.ath_change_percentage?.usd || 0,
      ath_date: data.market_data?.ath_date?.usd || '',
      atl: data.market_data?.atl?.usd || 0,
      atl_change_percentage: data.market_data?.atl_change_percentage?.usd || 0,
      atl_date: data.market_data?.atl_date?.usd || '',
      last_updated: data.last_updated || '',
    };
  } catch (error) {
    console.error('Error fetching crypto by id:', error);
    return null;
  }
}
