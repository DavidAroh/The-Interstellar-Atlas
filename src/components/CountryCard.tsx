import { Country } from '../services/countriesApi';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin } from 'lucide-react';

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  const navigate = useNavigate();

  const formatPopulation = (pop: number) => {
    return new Intl.NumberFormat('en-US').format(pop);
  };

  return (
    <div
      onClick={() => navigate(`/country/${country.cca3}`)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={country.flags.svg}
          alt={`Flag of ${country.name.common}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-3 truncate">
          {country.name.common}
        </h2>
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              <span className="font-semibold">Population:</span> {formatPopulation(country.population)}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              <span className="font-semibold">Region:</span> {country.region}
            </span>
          </div>
          {country.capital && country.capital.length > 0 && (
            <div className="text-gray-600">
              <span className="text-sm">
                <span className="font-semibold">Capital:</span> {country.capital[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
