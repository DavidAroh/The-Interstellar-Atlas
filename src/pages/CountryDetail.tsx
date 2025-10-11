import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCountryByCode, fetchCountriesByCodes, Country } from '../services/countriesApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { CountryMap } from '../components/CountryMap';
import { ArrowLeft, Globe2, MapPin, Users, Languages, DollarSign, Building } from 'lucide-react';

export function CountryDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [country, setCountry] = useState<Country | null>(null);
  const [borderCountries, setBorderCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      loadCountryData(code);
    }
  }, [code]);

  const loadCountryData = async (countryCode: string) => {
    try {
      setLoading(true);
      setError(null);

      const countryData = await fetchCountryByCode(countryCode);
      setCountry(countryData);

      if (countryData.borders && countryData.borders.length > 0) {
        const borders = await fetchCountriesByCodes(countryData.borders);
        setBorderCountries(borders);
      } else {
        setBorderCountries([]);
      }
    } catch (err) {
      setError('Failed to load country details. The country may not exist or there was a network error.');
      console.error('Error loading country:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPopulation = (pop: number) => {
    return new Intl.NumberFormat('en-US').format(pop);
  };

  const getNativeName = (country: Country) => {
    if (country.name.nativeName) {
      const nativeNames = Object.values(country.name.nativeName);
      if (nativeNames.length > 0) {
        return nativeNames[0].common;
      }
    }
    return country.name.common;
  };

  const getCurrencies = (country: Country) => {
    if (!country.currencies) return 'N/A';
    return Object.values(country.currencies)
      .map(curr => `${curr.name} (${curr.symbol})`)
      .join(', ');
  };

  const getLanguages = (country: Country) => {
    if (!country.languages) return 'N/A';
    return Object.values(country.languages).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <ErrorMessage
            message={error || 'Country not found'}
            onRetry={() => code && loadCountryData(code)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:shadow-md transition-all mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to All Countries
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white">
            <img
              src={country.flags.svg}
              alt={`Flag of ${country.name.common}`}
              className="w-full h-auto"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{country.name.common}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoItem
                  icon={<Globe2 className="w-5 h-5" />}
                  label="Native Name"
                  value={getNativeName(country)}
                />
                <InfoItem
                  icon={<Users className="w-5 h-5" />}
                  label="Population"
                  value={formatPopulation(country.population)}
                />
                <InfoItem
                  icon={<MapPin className="w-5 h-5" />}
                  label="Region"
                  value={country.region}
                />
                <InfoItem
                  icon={<MapPin className="w-5 h-5" />}
                  label="Sub Region"
                  value={country.subregion || 'N/A'}
                />
              </div>

              <div className="space-y-4">
                <InfoItem
                  icon={<Building className="w-5 h-5" />}
                  label="Capital"
                  value={country.capital && country.capital.length > 0 ? country.capital.join(', ') : 'N/A'}
                />
                <InfoItem
                  icon={<Globe2 className="w-5 h-5" />}
                  label="Top Level Domain"
                  value={country.tld && country.tld.length > 0 ? country.tld.join(', ') : 'N/A'}
                />
                <InfoItem
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Currencies"
                  value={getCurrencies(country)}
                />
                <InfoItem
                  icon={<Languages className="w-5 h-5" />}
                  label="Languages"
                  value={getLanguages(country)}
                />
              </div>
            </div>
          </div>
        </div>

        {country.latlng && country.latlng.length === 2 && (
          <CountryMap
            countryName={country.name.common}
            latitude={country.latlng[0]}
            longitude={country.latlng[1]}
          />
        )}

        {borderCountries.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Border Countries</h2>
            <div className="flex flex-wrap gap-3">
              {borderCountries.map((border) => (
                <button
                  key={border.cca3}
                  onClick={() => navigate(`/country/${border.cca3}`)}
                  className="px-6 py-3 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  {border.name.common}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-gray-900 font-semibold">{value}</p>
      </div>
    </div>
  );
}
