const BASE_URL = 'https://restcountries.com/v3.1';

export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  tld?: string[];
  latlng?: number[];
  currencies?: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  languages?: {
    [key: string]: string;
  };
  borders?: string[];
}

class CountriesCache {
  private cache: Map<string, Country> = new Map();
  private allCountriesCache: Country[] | null = null;
  private lastFetchTime: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000;
  private STORAGE_KEY = 'interstellar_atlas_countries_v1';
  private COUNTRY_DETAIL_KEY_PREFIX = 'interstellar_atlas_country_';

  constructor() {
    // Try to hydrate cache from localStorage if available and not stale.
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { timestamp: number; countries: Country[] };
          if (parsed && parsed.timestamp && parsed.countries) {
            const age = Date.now() - parsed.timestamp;
            if (age < this.CACHE_DURATION) {
              this.allCountriesCache = parsed.countries;
              this.lastFetchTime = parsed.timestamp;
              parsed.countries.forEach(country => this.cache.set(country.cca3, country));
            } else {
              // stale -> remove
              localStorage.removeItem(this.STORAGE_KEY);
            }
          }
        }
      }
    } catch (e) {
      // ignore localStorage errors (security settings)
    }
  }

  private persistAllCountriesToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && this.allCountriesCache) {
        const payload = { timestamp: this.lastFetchTime, countries: this.allCountriesCache };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (e) {
      // ignore
    }
  }

  private persistCountryDetailToStorage(country: Country) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const key = `${this.COUNTRY_DETAIL_KEY_PREFIX}${country.cca3}`;
        const payload = { timestamp: Date.now(), country };
        localStorage.setItem(key, JSON.stringify(payload));
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }

  private getCountryDetailFromStorage(code: string): Country | undefined {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const key = `${this.COUNTRY_DETAIL_KEY_PREFIX}${code}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as { timestamp: number; country: Country };
          if (parsed && parsed.timestamp && parsed.country) {
            const age = Date.now() - parsed.timestamp;
            if (age < this.CACHE_DURATION) {
              return parsed.country;
            } else {
              // stale -> remove
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return undefined;
  }

  set(key: string, data: Country): void {
    this.cache.set(key, data);
    // Persist detailed country data to localStorage
    this.persistCountryDetailToStorage(data);
  }

  get(key: string): Country | undefined {
    // First check in-memory cache
    let country = this.cache.get(key);
    
    // If not in memory, check localStorage
    if (!country) {
      country = this.getCountryDetailFromStorage(key);
      if (country) {
        // Restore to in-memory cache
        this.cache.set(key, country);
      }
    }
    
    return country;
  }

  setAllCountries(countries: Country[]): void {
    this.allCountriesCache = countries;
    this.lastFetchTime = Date.now();
    countries.forEach(country => {
      this.cache.set(country.cca3, country);
    });
    this.persistAllCountriesToStorage();
  }

  getAllCountries(): Country[] | null {
    if (this.allCountriesCache && Date.now() - this.lastFetchTime < this.CACHE_DURATION) {
      return this.allCountriesCache;
    }
    return null;
  }

  has(key: string): boolean {
    return this.cache.has(key) || this.getCountryDetailFromStorage(key) !== undefined;
  }
}

const cache = new CountriesCache();

export async function fetchAllCountries(): Promise<Country[]> {
  const cached = cache.getAllCountries();
  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${BASE_URL}/all?fields=name,cca3,capital,region,subregion,population,flags`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }

  const data: Country[] = await response.json();
  cache.setAllCountries(data);
  return data;
}

export async function fetchCountryByCode(code: string): Promise<Country> {
  const cached = cache.get(code);
  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${BASE_URL}/alpha/${code}?fields=name,cca3,capital,region,subregion,population,flags,tld,currencies,languages,borders,latlng`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch country');
  }

  // The API may return either an array (older behavior) or a single object.
  const data = await response.json();
  const country: Country | undefined = Array.isArray(data) ? data[0] : data;

  if (!country) {
    throw new Error('Country data not found for code: ' + code);
  }

  cache.set(code, country);
  return country;
}

export async function fetchCountriesByCodes(codes: string[]): Promise<Country[]> {
  const uncachedCodes = codes.filter(code => !cache.has(code));

  if (uncachedCodes.length === 0) {
    return codes.map(code => cache.get(code)!);
  }

  const response = await fetch(`${BASE_URL}/alpha?codes=${uncachedCodes.join(',')}&fields=name,cca3`);

  if (!response.ok) {
    throw new Error('Failed to fetch border countries');
  }

  const data: Country[] = await response.json();
  data.forEach(country => {
    cache.set(country.cca3, country);
  });

  return codes.map(code => cache.get(code)!).filter(Boolean);
}
