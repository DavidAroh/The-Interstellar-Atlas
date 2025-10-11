import { Filter } from 'lucide-react';

interface RegionFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const REGIONS = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export function RegionFilter({ value, onChange }: RegionFilterProps) {
  return (
    <div className="relative">
      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm appearance-none bg-white cursor-pointer"
      >
        {REGIONS.map((region) => (
          <option key={region} value={region}>
            {region === 'All' ? 'Filter by Region' : region}
          </option>
        ))}
      </select>
    </div>
  );
}
