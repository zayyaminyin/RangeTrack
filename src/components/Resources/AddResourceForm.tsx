import React, { useState } from 'react';
import { Resource, ResourceType } from '../../types';
import { CameraIcon } from 'lucide-react';
import { FARM_ANIMALS, FARM_EQUIPMENT, FARM_FEED } from '../../constants/farmData';

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
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedFeed, setSelectedFeed] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');
  const [health, setHealth] = useState('');

  const handleAnimalSelect = (value: string) => {
    setSelectedAnimal(value);
    if (value && value !== 'custom') {
      // Find the animal label for the selected value
      const animal = FARM_ANIMALS.find(a => a.value === value);
      setName(animal?.label || '');
    } else if (value === 'custom') {
      setName(''); // Clear name for custom input
    }
  };

  const handleEquipmentSelect = (value: string) => {
    setSelectedEquipment(value);
    if (value && value !== 'custom') {
      // Find the equipment label for the selected value
      const equipment = FARM_EQUIPMENT.find(e => e.value === value);
      setName(equipment?.label || '');
    } else if (value === 'custom') {
      setName(''); // Clear name for custom input
    }
  };

  const handleFeedSelect = (value: string) => {
    setSelectedFeed(value);
    if (value && value !== 'custom') {
      // Find the feed label for the selected value
      const feed = FARM_FEED.find(f => f.value === value);
      setName(feed?.label || '');
    } else if (value === 'custom') {
      setName(''); // Clear name for custom input
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {resourceType === 'animal' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Animal Type
          </label>
          <select 
            value={selectedAnimal} 
            onChange={e => handleAnimalSelect(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {FARM_ANIMALS.map(animal => (
              <option key={animal.value} value={animal.value}>
                {animal.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {resourceType === 'equipment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipment Type
          </label>
          <select 
            value={selectedEquipment} 
            onChange={e => handleEquipmentSelect(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {FARM_EQUIPMENT.map(equipment => (
              <option key={equipment.value} value={equipment.value}>
                {equipment.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {resourceType === 'feed' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feed Type
          </label>
          <select 
            value={selectedFeed} 
            onChange={e => handleFeedSelect(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {FARM_FEED.map(feed => (
              <option key={feed.value} value={feed.value}>
                {feed.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {resourceType === 'animal' ? 'Animal Name' : resourceType === 'equipment' ? 'Equipment Name' : resourceType === 'feed' ? 'Feed Name' : 'Name'}
        </label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder={resourceType === 'animal' ? 'Enter animal name' : resourceType === 'equipment' ? 'Enter equipment name' : resourceType === 'feed' ? 'Enter feed name' : `Enter ${resourceType} name`} 
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
          required 
          disabled={(resourceType === 'animal' && selectedAnimal && selectedAnimal !== 'custom') || 
                   (resourceType === 'equipment' && selectedEquipment && selectedEquipment !== 'custom') ||
                   (resourceType === 'feed' && selectedFeed && selectedFeed !== 'custom')}
        />
        {resourceType === 'animal' && selectedAnimal && selectedAnimal !== 'custom' && (
          <p className="text-xs text-gray-500 mt-1">
            Using selected animal type. Choose "Other (custom name)" to enter a custom name.
          </p>
        )}
        {resourceType === 'equipment' && selectedEquipment && selectedEquipment !== 'custom' && (
          <p className="text-xs text-gray-500 mt-1">
            Using selected equipment type. Choose "Other (custom name)" to enter a custom name.
          </p>
        )}
        {resourceType === 'feed' && selectedFeed && selectedFeed !== 'custom' && (
          <p className="text-xs text-gray-500 mt-1">
            Using selected feed type. Choose "Other (custom name)" to enter a custom name.
          </p>
        )}
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

      {(resourceType === 'animal' || resourceType === 'equipment') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {resourceType === 'animal' ? 'Animal Health Status' : 'Equipment Condition'} (Optional)
          </label>
          <div className="space-y-2">
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={health} 
              onChange={e => setHealth(e.target.value)} 
              placeholder={resourceType === 'animal' ? 'Enter health score (0-100)' : 'Enter condition score (0-100)'} 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
            />
            <div className="text-xs text-gray-500">
              {resourceType === 'animal' ? (
                <div>
                  <p>• 90-100: Excellent health</p>
                  <p>• 70-89: Good health</p>
                  <p>• 50-69: Fair health</p>
                  <p>• 0-49: Poor health (needs attention)</p>
                </div>
              ) : (
                <div>
                  <p>• 90-100: Excellent condition</p>
                  <p>• 70-89: Good condition</p>
                  <p>• 50-69: Fair condition</p>
                  <p>• 0-49: Poor condition (needs repair)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
    </form>
  );
};