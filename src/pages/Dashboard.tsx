import { useState, useEffect, useMemo } from 'react';
import { fetchAllCountries, Country } from '../services/countriesApi';
import { CountryCard } from '../components/CountryCard';
import { SearchBar } from '../components/SearchBar';
import { RegionFilter } from '../components/RegionFilter';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { CountryCardSkeleton } from '../components/CountryCardSkeleton';
import { Globe } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function Dashboard() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCountries();
      setCountries(data);
    } catch (err) {
      setError('Failed to load countries. Please check your internet connection and try again.');
      console.error('Error loading countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    let filtered = countries;

    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion !== 'All') {
      filtered = filtered.filter(country => country.region === selectedRegion);
    }

    return filtered;
  }, [countries, searchTerm, selectedRegion]);

  const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCountries = filteredCountries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">The Interstellar Atlas</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error} onRetry={loadCountries} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">The Interstellar Atlas</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
            <div className="sm:w-64">
              <RegionFilter value={selectedRegion} onChange={setSelectedRegion} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <CountryCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No countries found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRegion('All');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCountries.length)} of {filteredCountries.length} countries
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCountries.map((country) => (
                <CountryCard key={country.cca3} country={country} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
