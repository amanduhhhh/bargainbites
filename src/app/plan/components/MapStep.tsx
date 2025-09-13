'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PlanData } from '../page';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

interface MapStepProps {
  data: PlanData;
  updateData: (updates: Partial<PlanData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Mock store data - in a real app, this would come from an API
const MOCK_STORES = [
  {
    id: 'walmart-1',
    name: 'Walmart Supercentre',
    address: '123 Main St, Toronto, ON',
    distance: 0.8,
    hasCar: true,
    noCar: false,
    logo: '/company-logos/Walmart_logo_(2008).svg.png',
    deals: ['Fresh produce 20% off', 'Bulk items available'],
    rating: 4.2
  },
  {
    id: 'loblaws-1',
    name: 'Loblaws',
    address: '456 Queen St, Toronto, ON',
    distance: 1.2,
    hasCar: true,
    noCar: true,
    logo: '/company-logos/Loblaws-Logo.png',
    deals: ['PC Points bonus', 'Organic section'],
    rating: 4.5
  },
  {
    id: 'metro-1',
    name: 'Metro',
    address: '789 King St, Toronto, ON',
    distance: 0.5,
    hasCar: true,
    noCar: true,
    logo: '/company-logos/Metro_Inc._logo.svg.png',
    deals: ['Weekly flyer deals', 'Fresh bakery'],
    rating: 4.0
  },
  {
    id: 'sobeys-1',
    name: 'Sobeys',
    address: '321 College St, Toronto, ON',
    distance: 2.1,
    hasCar: true,
    noCar: false,
    logo: '/company-logos/Sobeys_logo.svg.png',
    deals: ['Air Miles rewards', 'Premium products'],
    rating: 4.3
  },
  {
    id: 'freshco-1',
    name: 'FreshCo',
    address: '654 Spadina Ave, Toronto, ON',
    distance: 1.8,
    hasCar: true,
    noCar: false,
    logo: '/company-logos/FreshCo_logo.svg.png',
    deals: ['Budget-friendly prices', 'Weekly specials'],
    rating: 4.1
  }
];

export default function MapStep({ data, updateData }: MapStepProps) {
  const [selectedStore, setSelectedStore] = useState<string | null>(data.selectedStore);
  const [filteredStores, setFilteredStores] = useState(MOCK_STORES);

  useEffect(() => {
    // Filter stores based on car access and sort by distance (shortest to longest)
    const filtered = MOCK_STORES.filter(store => {
      if (data.hasCar) {
        return store.hasCar;
      } else {
        return store.noCar;
      }
    }).sort((a, b) => a.distance - b.distance);
    setFilteredStores(filtered);
  }, [data.hasCar]);

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
    updateData({ selectedStore: storeId });
  };

  const getDistanceColor = (distance: number) => {
    return 'text-black';
  };

  const getDistanceIcon = (distance: number) => {
    return '-';
  };

  return (
    <div className="step-fade-in">
      <h2 className="text-lg font-medium mb-2">Choose your preferred store</h2>
      <p className="text-sm text-black/60 mb-6">
        Based on your location and transport options, here are the best stores near you.
      </p>

      {/* Map Component */}
      <div className="mb-6">
        <MapComponent 
          postalCode={data.postalCode}
          stores={filteredStores}
          selectedStore={selectedStore}
          onStoreSelect={handleStoreSelect}
        />
      </div>

      {/* Store List */}
      <div className="space-y-3">
        <h3 className="text-base font-medium mb-3">
          Available stores ({filteredStores.length})
        </h3>
        
        {filteredStores.map((store) => (
          <div
            key={store.id}
            onClick={() => handleStoreSelect(store.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedStore === store.id
                ? 'border-foreground bg-foreground/5 ring-2 ring-foreground/20'
                : 'border-black/10 hover:border-black/20 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                <img 
                  src={store.logo} 
                  alt={store.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{store.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getDistanceColor(store.distance)}`}>
                      {getDistanceIcon(store.distance)} {store.distance}km
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-black">★</span>
                      <span className="text-xs text-black">{store.rating}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-black mb-2">{store.address}</p>
                
                <div className="flex flex-wrap gap-1">
                  {store.deals.map((deal, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-black text-xs rounded-full"
                    >
                      {deal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

     
      
    </div>
  );
}
