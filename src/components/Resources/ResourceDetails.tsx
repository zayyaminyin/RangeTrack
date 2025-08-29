import React from 'react';
import { XIcon, TreesIcon, TractorIcon, WheatIcon, CalendarIcon, ClipboardIcon, BirdIcon } from 'lucide-react';
import { Resource } from '../../types';
interface ResourceDetailsProps {
  resource: Resource;
  onClose: () => void;
}
export const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  resource,
  onClose
}) => {
  const getResourceTypeIcon = () => {
    switch (resource.type) {
      case 'animal':
        return <BirdIcon size={20} className="text-amber-600" />;
      case 'field':
        return <TreesIcon size={20} className="text-green-600" />;
      case 'equipment':
        return <TractorIcon size={20} className="text-yellow-600" />;
      case 'feed':
        return <WheatIcon size={20} className="text-amber-600" />;
    }
  };
  const getHealthStatusClass = (health?: number) => {
    if (health === undefined) return '';
    if (health >= 80) return 'bg-green-100 text-green-800';
    if (health >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  const getResourceTypeLabel = () => {
    switch (resource.type) {
      case 'animal':
        return 'Animal';
      case 'field':
        return 'Field';
      case 'equipment':
        return 'Equipment';
      case 'feed':
        return 'Feed';
    }
  };
  return <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="bg-green-700 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              {getResourceTypeIcon()}
              <h2 className="text-xl font-bold ml-2">{resource.name}</h2>
            </div>
            <p className="text-green-100 text-sm mt-1">
              {getResourceTypeLabel()}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-green-600">
            <XIcon size={20} />
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        {/* Basic Info */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Basic Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {resource.quantity !== undefined && <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="text-sm font-medium">{resource.quantity}</span>
              </div>}
            {resource.status && <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${resource.status === 'active' ? 'bg-green-100 text-green-800' : resource.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>
                  {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                </span>
              </div>}
            {resource.lastChecked && <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Checked:</span>
                <span className="text-sm font-medium">
                  {new Date(resource.lastChecked).toLocaleDateString()}
                </span>
              </div>}
          </div>
        </div>
        {/* Health Status */}
        {resource.health !== undefined && <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Health Status
            </h3>
            <div className={`rounded-lg p-3 ${getHealthStatusClass(resource.health)}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Health Score</span>
                <span className="text-lg font-bold">{resource.health}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                <div className="h-2 rounded-full bg-current" style={{
              width: `${resource.health}%`
            }}></div>
              </div>
            </div>
          </div>}
        {/* Notes */}
        {resource.notes && <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex">
                <ClipboardIcon size={16} className="text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{resource.notes}</p>
              </div>
            </div>
          </div>}
      </div>
      {/* Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex space-x-2">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium">
            Edit
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm font-medium">
            Log Activity
          </button>
        </div>
      </div>
    </div>;
};