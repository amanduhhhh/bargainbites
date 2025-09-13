'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  hasCar: boolean;
  noCar: boolean;
  logo: string;
  deals: string[];
  rating: number;
  lat?: number;
  lng?: number;
}

interface MapComponentProps {
  postalCode: string;
  stores: Store[];
  selectedStore: string | null;
  onStoreSelect: (storeId: string) => void;
}

// Component to handle map updates when stores change
function MapUpdater({ stores }: { stores: Store[]; selectedStore: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (stores.length > 0) {
      // Create bounds to fit all stores
      const bounds = L.latLngBounds(
        stores.map(store => [store.lat || 43.4643, store.lng || -80.5204])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [stores, map]);

  return null;
}

export default function MapComponent({ stores, selectedStore, onStoreSelect }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Actual coordinates for flyer-providing stores near 256 Phillip Street, Waterloo, ON
  const getStoreCoordinates = (storeId: string) => {
    const coordinates: { [key: string]: [number, number] } = {
      'zehrs-conestoga': [43.4620, -80.5350],           // 555 Davenport Rd, Waterloo
      'belfiores-independent': [43.4350, -80.4820],     // 385 Frederick St, Kitchener
      'tnt-supermarket': [43.4580, -80.5280],           // 50 Westmount Rd N B1, Waterloo
      'walmart-farmers-market': [43.4400, -80.5600],    // 335 Farmers Market Rd, Waterloo
      'real-canadian-superstore': [43.4280, -80.4950],  // 875 Highland Rd W, Kitchener
    };
    return coordinates[storeId] || [43.4643, -80.5204]; // Default to 256 Phillip St
  };

  const storesWithCoords = stores.map((store) => {
    const [lat, lng] = getStoreCoordinates(store.id);
    return {
      ...store,
      lat,
      lng,
    };
  });

  // Default center (256 Phillip Street, Waterloo, ON coordinates)
  const defaultCenter: [number, number] = [43.4643, -80.5204];

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater stores={storesWithCoords} selectedStore={selectedStore} />
        
        {/* User Location Marker */}
        <Marker
          position={defaultCenter}
          icon={L.divIcon({
            className: 'user-location-marker',
            html: `
              <div class="w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center shadow-lg">
                <div class="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium text-sm mb-1">Your Location</h3>
              <p className="text-xs text-gray-600">256 Phillip Street, Waterloo, ON</p>
            </div>
          </Popup>
        </Marker>
        
        {storesWithCoords.map((store) => {
          const isSelected = selectedStore === store.id;
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div class="w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center shadow-lg ${
                isSelected ? 'border-blue-500' : 'border-gray-400'
              }">
                <div class="w-4 h-4 bg-orange-500 rounded-full"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          return (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => onStoreSelect(store.id),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium text-sm mb-1">{store.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{store.address}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {store.distance}km away
                    </span>
                    <span className="text-xs text-gray-600">
                      ★ {store.rating}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {store.deals.slice(0, 2).map((deal, index) => (
                      <div key={index} className="text-xs text-gray-700">
                        • {deal}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onStoreSelect(store.id)}
                    className={`mt-2 w-full text-xs py-1 px-2 rounded-sm ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Store'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
