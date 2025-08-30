import React, { useState } from 'react';
import { Resource, ResourceType } from '../../types';
import { PlusIcon, SearchIcon, FilterIcon, ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { ResourceList } from './ResourceList';
import { AddResourceForm } from './AddResourceForm';
import { ResourceDetails } from './ResourceDetails';
interface ResourceManagerProps {
  resources: Resource[];
  onAddResource: (resource: Omit<Resource, 'id'>) => void;
  onUpdateResource: (resourceId: string, updates: Partial<Resource>) => void;
  onDeleteResource: (resourceId: string) => void;
}
export const ResourceManager: React.FC<ResourceManagerProps> = ({
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource
}) => {
  const [activeTab, setActiveTab] = useState<ResourceType>('animal');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'quantity'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const tabs: {
    type: ResourceType;
    label: string;
  }[] = [{
    type: 'animal',
    label: 'Animals'
  }, {
    type: 'field',
    label: 'Fields'
  }, {
    type: 'equipment',
    label: 'Equipment'
  }, {
    type: 'feed',
    label: 'Feed'
  }];
  // Filter resources by type and search query
  const filteredResources = resources.filter(resource => resource.type === activeTab && (searchQuery === '' || resource.name.toLowerCase().includes(searchQuery.toLowerCase())));
  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else {
      const qtyA = a.quantity || 0;
      const qtyB = b.quantity || 0;
      return sortDirection === 'asc' ? qtyA - qtyB : qtyB - qtyA;
    }
  });
  const handleSort = (field: 'name' | 'quantity') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };
  return <div className="pb-16">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-800">Resource Manager</h1>
        <button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2">
          <PlusIcon size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input type="text" placeholder="Search resources..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map(tab => <button key={tab.type} onClick={() => setActiveTab(tab.type)} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === tab.type ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>)}
      </div>

      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
        <div className="flex items-center">
          <FilterIcon size={12} className="mr-1" />
          <span>Sort by:</span>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => handleSort('name')} className={`flex items-center ${sortBy === 'name' ? 'text-green-600 font-medium' : ''}`}>
            Name
            {sortBy === 'name' && (sortDirection === 'asc' ? <ArrowUpIcon size={12} className="ml-1" /> : <ArrowDownIcon size={12} className="ml-1" />)}
          </button>
          {(activeTab === 'animal' || activeTab === 'feed') && <button onClick={() => handleSort('quantity')} className={`flex items-center ${sortBy === 'quantity' ? 'text-green-600 font-medium' : ''}`}>
              Quantity
              {sortBy === 'quantity' && (sortDirection === 'asc' ? <ArrowUpIcon size={12} className="ml-1" /> : <ArrowDownIcon size={12} className="ml-1" />)}
            </button>}
        </div>
      </div>

      {/* Resource List */}
      <ResourceList resources={sortedResources} onResourceClick={handleResourceClick} />

      {/* Add Resource Form */}
      {showAddForm && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Resource</h2>
            <AddResourceForm resourceType={activeTab} onSubmit={resource => {
          onAddResource(resource);
          setShowAddForm(false);
        }} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>}

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ResourceDetails 
            resource={selectedResource} 
            onClose={() => setSelectedResource(null)}
            onUpdate={onUpdateResource}
            onDelete={onDeleteResource}
          />
        </div>
      )}
    </div>;
};