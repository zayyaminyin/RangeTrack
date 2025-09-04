import React, { useState } from 'react';
import { 
  MapIcon, 
  MapPinIcon, 
  NavigationIcon, 
  LayersIcon,
  SearchIcon,
  PlusIcon,
  EyeIcon
} from 'lucide-react';
import { Resource } from '../../types';

interface MapLocation {
  id: string;
  name: string;
  type: 'field' | 'building' | 'equipment' | 'water_source' | 'fence';
  coordinates: { lat: number; lng: number };
  description?: string;
  status?: 'active' | 'maintenance' | 'inactive';
}

interface MapProps {
  resources: Resource[];
}

export const Map: React.FC<MapProps> = ({ resources }) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'field' | 'building' | 'equipment' | 'water_source' | 'fence'>('all');
  const [showAddLocation, setShowAddLocation] = useState(false);

  // Generate demo map locations based on resources
  const mapLocations: MapLocation[] = [
    // Fields
    {
      id: 'field-1',
      name: 'North Pasture',
      type: 'field',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      description: '85 acres of mixed grass pasture',
      status: 'active'
    },
    {
      id: 'field-2',
      name: 'South Corn Field',
      type: 'field',
      coordinates: { lat: 40.7100, lng: -74.0080 },
      description: '120 acres of premium corn field',
      status: 'active'
    },
    // Buildings
    {
      id: 'building-1',
      name: 'Main Barn',
      type: 'building',
      coordinates: { lat: 40.7135, lng: -74.0065 },
      description: 'Main storage and equipment barn',
      status: 'active'
    },
    // Equipment
    {
      id: 'equipment-1',
      name: 'Tractor Location',
      type: 'equipment',
      coordinates: { lat: 40.7130, lng: -74.0060 },
      description: 'John Deere 6120R Tractor',
      status: 'active'
    },
    // Water Sources
    {
      id: 'water-1',
      name: 'Main Water Trough',
      type: 'water_source',
      coordinates: { lat: 40.7125, lng: -74.0055 },
      description: 'Primary water source for North Pasture',
      status: 'active'
    }
  ];

  const filteredLocations = mapLocations.filter(location => 
    activeFilter === 'all' || location.type === activeFilter
  );

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'field':
        return '🌾';
      case 'building':
        return '🏠';
      case 'equipment':
        return '🚜';
      case 'water_source':
        return '💧';
      case 'fence':
        return '🚧';
      default:
        return '📍';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'maintenance':
        return 'text-yellow-600';
      case 'inactive':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getLocationCount = (type: string) => {
    if (type === 'all') return mapLocations.length;
    return mapLocations.filter(loc => loc.type === type).length;
  };

  return (
    <div className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Farm Map</h1>
          <p className="text-gray-600">Interactive map of your farm locations and resources</p>
        </div>
        <button
          onClick={() => setShowAddLocation(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon size={20} />
          <span>Add Location</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'all', label: 'All Locations', count: getLocationCount('all') },
          { key: 'field', label: 'Fields', count: getLocationCount('field') },
          { key: 'building', label: 'Buildings', count: getLocationCount('building') },
          { key: 'equipment', label: 'Equipment', count: getLocationCount('equipment') },
          { key: 'water_source', label: 'Water Sources', count: getLocationCount('water_source') },
          { key: 'fence', label: 'Fences', count: getLocationCount('fence') }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as any)}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
              activeFilter === filter.key
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Farm Layout</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <SearchIcon size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <NavigationIcon size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <LayersIcon size={20} />
                </button>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="relative bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapIcon size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Interactive Map</h3>
                <p className="text-gray-500 mb-4">
                  This would display an interactive map with your farm locations
                </p>
                <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
                  {filteredLocations.slice(0, 3).map(location => (
                    <div
                      key={location.id}
                      onClick={() => setSelectedLocation(location)}
                      className="p-2 bg-white rounded border cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getLocationIcon(location.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{location.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{location.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location List */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Locations ({filteredLocations.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLocations.map(location => (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedLocation?.id === location.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{getLocationIcon(location.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{location.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{location.type.replace('_', ' ')}</p>
                      {location.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {location.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-medium ${getStatusColor(location.status || 'active')}`}>
                          {location.status || 'active'}
                        </span>
                        <button className="text-primary-600 hover:text-primary-700">
                          <EyeIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Fields</span>
                <span className="font-medium">{getLocationCount('field')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Buildings</span>
                <span className="font-medium">{getLocationCount('building')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Water Sources</span>
                <span className="font-medium">{getLocationCount('water_source')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Equipment</span>
                <span className="font-medium">{getLocationCount('equipment')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getLocationIcon(selectedLocation.type)}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedLocation.name}</h2>
                  <p className="text-sm text-gray-600 capitalize">{selectedLocation.type.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {selectedLocation.description && (
              <p className="text-gray-700 mb-4">{selectedLocation.description}</p>
            )}

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-medium ${getStatusColor(selectedLocation.status || 'active')}`}>
                  {selectedLocation.status || 'active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coordinates</span>
                <span className="text-sm font-mono text-gray-800">
                  {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button className="btn-primary flex-1">
                <NavigationIcon size={16} className="mr-2" />
                Navigate
              </button>
              <button className="btn-secondary flex-1">
                <MapPinIcon size={16} className="mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter location name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="field">Field</option>
                  <option value="building">Building</option>
                  <option value="equipment">Equipment</option>
                  <option value="water_source">Water Source</option>
                  <option value="fence">Fence</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddLocation(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement add location logic
                  setShowAddLocation(false);
                }}
                className="btn-primary"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
