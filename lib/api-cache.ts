// Request deduplication and caching layer for API calls
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
};

const REQUEST_CACHE = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Generate cache key from function name and parameters
function getCacheKey(fnName: string, params: Record<string, any>): string {
  return `${fnName}:${JSON.stringify(params)}`;
}

// Check if cache entry is still valid
function isCacheValid(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

// Create fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// Wrapper for API functions with caching and deduplication
export function createCachedApiFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  fnName: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = getCacheKey(fnName, { args });
    
    // Check if there's a valid cache entry
    const cached = REQUEST_CACHE.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      return cached.data;
    }
    
    // Check if there's an in-flight request (deduplication)
    if (cached?.promise) {
      return cached.promise;
    }
    
    // Make the actual API call
    const promise = fn(...args).then((result) => {
      // Cache the result
      REQUEST_CACHE.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      return result;
    }).catch((error) => {
      // Remove failed promise from cache
      if (REQUEST_CACHE.get(cacheKey)?.promise === promise) {
        REQUEST_CACHE.delete(cacheKey);
      }
      throw error;
    });
    
    // Store the promise for deduplication
    REQUEST_CACHE.set(cacheKey, {
      data: null as any,
      timestamp: Date.now(),
      promise,
    });
    
    return promise;
  }) as T;
}

// Export fetchWithTimeout for use in API functions
export { fetchWithTimeout, REQUEST_TIMEOUT };
