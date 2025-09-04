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
            
            {/* Apple Maps Style Map */}
            <div className="relative bg-gradient-to-br from-green-50 via-green-100 to-amber-50 rounded-lg h-96 overflow-hidden">
              {/* Map Background Pattern */}
              <div className="absolute inset-0">
                {/* Roads */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                  {/* Main road */}
                  <path d="M 0 150 Q 100 130 200 150 Q 300 170 400 150" 
                        stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.8"/>
                  <path d="M 0 150 Q 100 130 200 150 Q 300 170 400 150" 
                        stroke="#e5e7eb" strokeWidth="2" fill="none"/>
                  
                  {/* Side roads */}
                  <path d="M 150 0 L 160 300" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.6"/>
                  <path d="M 150 0 L 160 300" stroke="#e5e7eb" strokeWidth="1.5" fill="none"/>
                  
                  <path d="M 250 0 Q 260 150 270 300" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.5"/>
                  <path d="M 250 0 Q 260 150 270 300" stroke="#e5e7eb" strokeWidth="1" fill="none"/>
                </svg>

                {/* Field Areas */}
                <div className="absolute top-4 left-4 w-24 h-20 bg-green-200/40 rounded-lg transform rotate-3"></div>
                <div className="absolute top-12 right-6 w-32 h-24 bg-amber-200/40 rounded-lg transform -rotate-2"></div>
                <div className="absolute bottom-6 left-8 w-28 h-18 bg-green-300/40 rounded-lg transform rotate-1"></div>
                <div className="absolute bottom-4 right-12 w-20 h-16 bg-emerald-200/40 rounded-lg transform -rotate-1"></div>

                {/* Water feature */}
                <div className="absolute bottom-16 left-20 w-16 h-8 bg-blue-300/50 rounded-full"></div>
              </div>

              {/* Map Pins for Locations */}
              {filteredLocations.slice(0, 5).map((location, index) => (
                <div
                  key={location.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${20 + index * 70}px`,
                    top: `${60 + Math.sin(index) * 50 + 50}px`,
                  }}
                  onClick={() => setSelectedLocation(location)}
                >
                  {/* Map Pin */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm animate-bounce">
                      📍
                    </div>
                    {/* Pin Shadow */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black/20 rounded-full blur-sm"></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      <div className="text-xs font-semibold text-gray-800">{location.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{location.type.replace('_', ' ')}</div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50">
                  <SearchIcon size={18} />
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50">
                  <NavigationIcon size={18} />
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50">
                  <LayersIcon size={18} />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
                <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-b">
                  <span className="text-lg font-bold">+</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                  <span className="text-lg font-bold">−</span>
                </button>
              </div>

              {/* Scale Indicator */}
              <div className="absolute bottom-4 left-4 bg-white/90 rounded px-3 py-1 text-xs text-gray-600 backdrop-blur-sm">
                100m
              </div>

              {/* Location Quick Preview Cards */}
              <div className="absolute top-4 left-4 max-w-xs">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Farm Locations</div>
                  <div className="space-y-1">
                    {filteredLocations.slice(0, 3).map(location => (
                      <div
                        key={location.id}
                        onClick={() => setSelectedLocation(location)}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center text-xs">
                          {getLocationIcon(location.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">{location.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{location.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location List */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Locations ({filteredLocations.length})</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredLocations.map((location, index) => (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover-lift ${
                    selectedLocation?.id === location.id
                      ? 'bg-primary-50 border-l-4 border-l-primary-500'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  } ${index !== filteredLocations.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {getLocationIcon(location.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{location.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          location.status === 'active' ? 'bg-green-100 text-green-800' :
                          location.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {location.status || 'active'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 capitalize mb-2">{location.type.replace('_', ' ')}</p>
                      {location.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {location.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {location.coordinates.lat.toFixed(2)}, {location.coordinates.lng.toFixed(2)}
                        </span>
                        <button className="text-primary-600 hover:text-primary-700 p-1 rounded-full hover:bg-primary-50 transition-colors">
                          <EyeIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredLocations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MapPinIcon size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No locations found</p>
                  <p className="text-xs mt-1">Try adjusting your filter</p>
                </div>
              )}
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
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                    {getLocationIcon(selectedLocation.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedLocation.name}</h2>
                    <p className="text-primary-100 capitalize">{selectedLocation.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-primary-100 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedLocation.description && (
                <div className="mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {selectedLocation.description}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    selectedLocation.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedLocation.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedLocation.status || 'active'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Coordinates</span>
                  </div>
                  <span className="text-sm font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded-md">
                    {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex space-x-3">
                <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
                  <NavigationIcon size={18} />
                  <span>Navigate</span>
                </button>
                <button className="btn-secondary flex-1 flex items-center justify-center space-x-2">
                  <MapPinIcon size={18} />
                  <span>Edit</span>
                </button>
              </div>
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
