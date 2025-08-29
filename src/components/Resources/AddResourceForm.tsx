import React, { useState } from 'react';
import { Resource, ResourceType } from '../../types';
import { CameraIcon } from 'lucide-react';
interface AddResourceFormProps {
  resourceType: ResourceType;
  onSubmit: (resource: Omit<Resource, 'id'>) => void;
  onCancel: () => void;
}
export const AddResourceForm: React.FC<AddResourceFormProps> = ({
  resourceType,
  onSubmit,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');
  const [health, setHealth] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResource: Omit<Resource, 'id'> = {
      type: resourceType,
      name,
      quantity: quantity ? parseInt(quantity, 10) : undefined,
      status,
      notes: notes || undefined,
      health: health ? parseInt(health, 10) : undefined,
      lastChecked: Date.now()
    };
    onSubmit(newResource);
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={`Enter ${resourceType} name`} className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Enter quantity" className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          {resourceType === 'equipment' && <option value="needs_repair">Needs Repair</option>}
        </select>
      </div>
      {(resourceType === 'animal' || resourceType === 'equipment') && <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Health Status (0-100)
          </label>
          <input type="number" min="0" max="100" value={health} onChange={e => setHealth(e.target.value)} placeholder="Enter health score" className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
        </div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any additional information..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" rows={3} />
      </div>
      {/* Photo Upload (placeholder) */}
      <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
        <div className="flex flex-col items-center">
          <CameraIcon size={24} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Add photo (optional)</p>
          <button type="button" className="mt-2 text-xs text-green-600">
            Choose file
          </button>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Add Resource
        </button>
      </div>
    </form>;
};