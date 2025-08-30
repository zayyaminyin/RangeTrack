import React, { useState, useRef } from 'react';
import { Resource } from '../../types';
import { CameraIcon, UploadIcon, XIcon, SaveIcon, TrashIcon } from 'lucide-react';

interface EditResourceFormProps {
  resource: Resource;
  onSave: (updatedResource: Partial<Resource>) => void;
  onDelete: (resourceId: string) => void;
  onCancel: () => void;
}

export const EditResourceForm: React.FC<EditResourceFormProps> = ({
  resource,
  onSave,
  onDelete,
  onCancel
}) => {
  const [name, setName] = useState(resource.name);
  const [quantity, setQuantity] = useState(resource.quantity?.toString() || '');
  const [status, setStatus] = useState(resource.status || 'active');
  const [health, setHealth] = useState(resource.health?.toString() || '');
  const [notes, setNotes] = useState(resource.notes || '');
  const [image, setImage] = useState<string | null>(resource.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updatedResource: Partial<Resource> = {
        name,
        quantity: quantity ? parseInt(quantity, 10) : undefined,
        status,
        health: health ? parseInt(health, 10) : undefined,
        notes: notes || undefined,
        image,
        lastChecked: Date.now()
      };
      await onSave(updatedResource);
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(resource.id);
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResourceTypeLabel = () => {
    switch (resource.type) {
      case 'animal': return 'Animal';
      case 'field': return 'Field';
      case 'equipment': return 'Equipment';
      case 'feed': return 'Feed';
      default: return 'Resource';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="bg-green-700 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Edit {getResourceTypeLabel()}</h2>
            <p className="text-green-100 text-sm mt-1">{resource.name}</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-full hover:bg-green-600">
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            min="0"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            {resource.type === 'equipment' && <option value="needs_repair">Needs Repair</option>}
          </select>
        </div>

        {/* Health/Condition (for animals and equipment) */}
        {(resource.type === 'animal' || resource.type === 'equipment') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {resource.type === 'animal' ? 'Health Status' : 'Equipment Condition'} (0-100)
            </label>
            <div className="space-y-2">
              <input
                type="number"
                min="0"
                max="100"
                value={health}
                onChange={(e) => setHealth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder={`Enter ${resource.type === 'animal' ? 'health' : 'condition'} score`}
              />
              <div className="text-xs text-gray-500">
                {resource.type === 'animal' ? (
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

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Add any additional information..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo
          </label>
          <div className="space-y-2">
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt={resource.name}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <CameraIcon size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">No photo uploaded</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center justify-center mx-auto"
                >
                  <UploadIcon size={16} className="mr-1" />
                  Upload Photo
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {!image && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Choose File
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
          >
            <SaveIcon size={16} className="mr-1" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center"
          >
            <TrashIcon size={16} className="mr-1" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete {getResourceTypeLabel()}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{resource.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 py-2 px-4 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
