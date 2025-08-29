import React from 'react';
import { Resource } from '../../types';
import { TreesIcon, TractorIcon, WheatIcon, AlertTriangleIcon, BirdIcon } from 'lucide-react';
interface ResourceListProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
}
export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  onResourceClick
}) => {
  // Get icon based on resource status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <span className="text-green-500">●</span>;
      case 'inactive':
        return <span className="text-gray-500">●</span>;
      case 'needs_repair':
        return <span className="text-orange-500">●</span>;
      default:
        return <span className="text-gray-500">●</span>;
    }
  };
  const getResourceIcon = (resource: Resource) => {
    switch (resource.type) {
      case 'animal':
        return <BirdIcon size={16} className="text-amber-600" />;
      case 'field':
        return <TreesIcon size={16} className="text-green-600" />;
      case 'equipment':
        return <TractorIcon size={16} className="text-yellow-600" />;
      case 'feed':
        return <WheatIcon size={16} className="text-amber-600" />;
    }
  };
  // Check if resource needs attention
  const needsAttention = (resource: Resource): boolean => {
    if (resource.type === 'equipment' && resource.status === 'needs_repair') {
      return true;
    }
    if (resource.health !== undefined && resource.health < 70) {
      return true;
    }
    return false;
  };
  if (resources.length === 0) {
    return <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
        <p>No resources in this category</p>
        <p className="text-sm">Click the + button to add one</p>
      </div>;
  }
  return <div className="space-y-2">
      {resources.map(resource => <div key={resource.id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50" onClick={() => onResourceClick(resource)}>
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="mr-3 mt-1">{getResourceIcon(resource)}</div>
              <div>
                <div className="flex items-center">
                  {getStatusIcon(resource.status)}
                  <h3 className="font-medium ml-2">{resource.name}</h3>
                  {needsAttention(resource) && <div className="ml-2 bg-red-100 text-red-600 rounded-full p-1">
                      <AlertTriangleIcon size={12} />
                    </div>}
                </div>
                {resource.quantity !== undefined && <p className="text-sm text-gray-600 mt-1">
                    Quantity: {resource.quantity}
                  </p>}
                {resource.status && <p className="text-xs text-gray-500 mt-1">
                    Status:{' '}
                    {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                  </p>}
                {resource.lastChecked && <p className="text-xs text-gray-500 mt-1">
                    Last checked:{' '}
                    {new Date(resource.lastChecked).toLocaleDateString()}
                  </p>}
              </div>
            </div>
            {resource.health !== undefined && <div className="flex flex-col items-end">
                <div className={`text-xs font-medium ${resource.health >= 80 ? 'text-green-600' : resource.health >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Health: {resource.health}%
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className={`h-1.5 rounded-full ${resource.health >= 80 ? 'bg-green-500' : resource.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
              width: `${resource.health}%`
            }}></div>
                </div>
              </div>}
          </div>
        </div>)}
    </div>;
};