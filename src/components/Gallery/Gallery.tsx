import React, { useState, useEffect } from 'react';
import { CameraIcon, UploadIcon, XIcon, DownloadIcon, EyeIcon, CalendarIcon } from 'lucide-react';
import { Task, Resource } from '../../types';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  type: 'task' | 'resource' | 'general';
  relatedId?: string;
  relatedName?: string;
  timestamp: number;
  tags?: string[];
}

interface GalleryProps {
  tasks: Task[];
  resources: Resource[];
}

export const Gallery: React.FC<GalleryProps> = ({ tasks, resources }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'task' | 'resource' | 'general'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Generate demo images from tasks and resources
  useEffect(() => {
    const demoImages: GalleryImage[] = [];

    // Add images from tasks
    tasks.forEach(task => {
      if (task.image) {
        const relatedResource = resources.find(r => r.id === task.resource_id);
        demoImages.push({
          id: `task-${task.id}`,
          url: task.image,
          title: `${task.type.replace('_', ' ')} - ${new Date(task.ts).toLocaleDateString()}`,
          description: task.notes || `Task completed on ${new Date(task.ts).toLocaleDateString()}`,
          type: 'task',
          relatedId: task.resource_id,
          relatedName: relatedResource?.name,
          timestamp: task.ts,
          tags: [task.type, relatedResource?.type || 'general']
        });
      }
    });

    // Add images from resources
    resources.forEach(resource => {
      if (resource.image) {
        demoImages.push({
          id: `resource-${resource.id}`,
          url: resource.image,
          title: resource.name,
          description: resource.notes || `${resource.type} resource`,
          type: 'resource',
          relatedId: resource.id,
          relatedName: resource.name,
          timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random timestamp within last 30 days
          tags: [resource.type, resource.status || 'active']
        });
      }
    });

    // Add some demo general farm images
    const demoFarmImages = [
      {
        id: 'demo-1',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
        title: 'Morning Sunrise Over Fields',
        description: 'Beautiful sunrise captured during morning rounds',
        type: 'general' as const,
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        tags: ['sunrise', 'landscape', 'morning']
      },
      {
        id: 'demo-2',
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        title: 'Cattle Grazing',
        description: 'Healthy cattle grazing in the north pasture',
        type: 'general' as const,
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        tags: ['cattle', 'grazing', 'pasture']
      },
      {
        id: 'demo-3',
        url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
        title: 'Farm Equipment',
        description: 'Tractor and equipment in the equipment shed',
        type: 'general' as const,
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        tags: ['equipment', 'tractor', 'maintenance']
      },
      {
        id: 'demo-4',
        url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
        title: 'Harvest Season',
        description: 'Corn harvest in progress',
        type: 'general' as const,
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
        tags: ['harvest', 'corn', 'seasonal']
      }
    ];

    setImages([...demoImages, ...demoFarmImages]);
  }, [tasks, resources]);

  const filteredImages = images.filter(image => 
    activeFilter === 'all' || image.type === activeFilter
  );

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const getImageCount = (type: 'all' | 'task' | 'resource' | 'general') => {
    if (type === 'all') return images.length;
    return images.filter(img => img.type === type).length;
  };

  return (
    <div className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Farm Gallery</h1>
          <p className="text-gray-600">Photos and images from your farm operations</p>
        </div>
        <button
          onClick={handleUpload}
          className="btn-primary flex items-center space-x-2"
        >
          <UploadIcon size={20} />
          <span>Upload</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'all', label: 'All Photos', count: getImageCount('all') },
          { key: 'task', label: 'Task Photos', count: getImageCount('task') },
          { key: 'resource', label: 'Resource Photos', count: getImageCount('resource') },
          { key: 'general', label: 'General', count: getImageCount('general') }
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

      {/* Image Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map(image => (
            <div
              key={image.id}
              onClick={() => handleImageClick(image)}
              className="relative group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-800 truncate">
                  {image.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(image.timestamp).toLocaleDateString()}
                </p>
                {image.relatedName && (
                  <p className="text-xs text-primary-600 mt-1">
                    {image.relatedName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No photos yet</h3>
          <p className="text-gray-600 mb-4">
            {activeFilter === 'all' 
              ? 'Start uploading photos to build your farm gallery'
              : `No ${activeFilter} photos found`
            }
          </p>
          <button
            onClick={handleUpload}
            className="btn-primary"
          >
            Upload First Photo
          </button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedImage.title}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon size={24} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full max-h-96 object-contain rounded-lg"
              />
              <div className="mt-4 space-y-2">
                {selectedImage.description && (
                  <p className="text-gray-700">{selectedImage.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon size={16} className="mr-2" />
                  {new Date(selectedImage.timestamp).toLocaleString()}
                </div>
                {selectedImage.relatedName && (
                  <p className="text-sm text-primary-600">
                    Related to: {selectedImage.relatedName}
                  </p>
                )}
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedImage.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.url;
                    link.download = selectedImage.title;
                    link.click();
                  }}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <DownloadIcon size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Upload Photo</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop your photo here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="btn-primary cursor-pointer"
              >
                Choose Photo
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement actual upload logic
                  setShowUploadModal(false);
                }}
                className="btn-primary"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
