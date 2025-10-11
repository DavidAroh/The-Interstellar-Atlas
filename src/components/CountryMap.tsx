import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface CountryMapProps {
  countryName: string;
  latitude: number;
  longitude: number;
}

export function CountryMap({ countryName, latitude, longitude }: CountryMapProps) {
  useEffect(() => {
    // Force map to recalculate size when component mounts
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-600" />
        Location on Map
      </h2>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Interactive Leaflet Map */}
        <div className="w-full h-96 relative">
          <MapContainer
            center={[latitude, longitude]}
            zoom={5}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-lg">{countryName}</p>
                  <p className="text-sm text-gray-600">
                    {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Coordinates:</span> {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Scroll to zoom • Drag to pan • Click marker for details
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=6/${latitude}/${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                OpenStreetMap
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
              >
                Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
