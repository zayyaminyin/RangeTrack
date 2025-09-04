import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  CameraIcon, 
  UploadIcon, 
  XIcon, 
  DownloadIcon, 
  EyeIcon, 
  SearchIcon,
  GridIcon,
  ListIcon,
  TrashIcon,
  ShareIcon,
  MapPinIcon,
  InfoIcon
} from 'lucide-react';
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
  fileSize?: number;
  dimensions?: { width: number; height: number };
  location?: { lat: number; lng: number; name?: string };
  isSelected?: boolean;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          tags: [task.type, relatedResource?.type || 'general'],
          fileSize: Math.floor(Math.random() * 5000000) + 1000000,
          dimensions: { width: 1920, height: 1080 },
          location: { lat: 40.7128 + Math.random() * 0.01, lng: -74.0060 + Math.random() * 0.01 }
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
          timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          tags: [resource.type, resource.status || 'active'],
          fileSize: Math.floor(Math.random() * 3000000) + 500000,
          dimensions: { width: 1600, height: 1200 },
          location: { lat: 40.7128 + Math.random() * 0.01, lng: -74.0060 + Math.random() * 0.01 }
        });
      }
    });

    // Add some demo general farm images
    const demoFarmImages = [
      {
        id: 'demo-1',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
        title: 'Morning Sunrise Over Fields',
        description: 'Beautiful sunrise captured during morning rounds',
        type: 'general' as const,
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        tags: ['sunrise', 'landscape', 'morning'],
        fileSize: 2500000,
        dimensions: { width: 1920, height: 1080 },
        location: { lat: 40.7128, lng: -74.0060, name: 'North Field' }
      },
      {
        id: 'demo-2',
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
        title: 'Cattle Grazing',
        description: 'Healthy cattle grazing in the north pasture',
        type: 'general' as const,
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        tags: ['cattle', 'grazing', 'pasture'],
        fileSize: 3200000,
        dimensions: { width: 1600, height: 1200 },
        location: { lat: 40.7130, lng: -74.0058, name: 'North Pasture' }
      }
    ];

    setImages([...demoImages, ...demoFarmImages]);
  }, [tasks, resources]);

  // Enhanced filtering and sorting
  const filteredAndSortedImages = useMemo(() => {
    const filtered = images.filter(image => {
      const matchesFilter = activeFilter === 'all' || image.type === activeFilter;
      const matchesSearch = searchQuery === '' || 
        image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    return filtered;
  }, [images, activeFilter, searchQuery]);

  // Enhanced utility functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageCount = (type: 'all' | 'task' | 'resource' | 'general') => {
    if (type === 'all') return images.length;
    return images.filter(img => img.type === type).length;
  };

  // Enhanced event handlers
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleImageSelect = (imageId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedImages);
    if (isSelected) {
      newSelected.add(imageId);
    } else {
      newSelected.delete(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === filteredAndSortedImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredAndSortedImages.map(img => img.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedImages.size > 0) {
      setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
      setSelectedImages(new Set());
    }
  };

  const handleDownloadSelected = () => {
    selectedImages.forEach(imageId => {
      const image = images.find(img => img.id === imageId);
      if (image) {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.title;
        link.click();
      }
    });
  };


  // Drag and drop functionality
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const fileId = `upload-${Date.now()}-${Math.random()}`;
      
      // Create image object
      const newImage: GalleryImage = {
        id: fileId,
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        type: 'general',
        timestamp: Date.now(),
        tags: ['uploaded'],
        fileSize: file.size,
        dimensions: { width: 1920, height: 1080 },
        location: { lat: 40.7128, lng: -74.0060 }
      };
      
      setImages(prev => [newImage, ...prev]);
    }
  };


  return (
    <div 
      className="pb-16 min-h-screen"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Simplified Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Farm Gallery</h1>
          <p className="text-gray-600">Photos and images from your farm operations</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedImages.size > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-600">{selectedImages.size} selected</span>
              <button
                onClick={handleDownloadSelected}
                className="btn-secondary flex items-center space-x-1 text-sm"
              >
                <DownloadIcon size={16} />
                <span>Download</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="btn-secondary flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
              >
                <TrashIcon size={16} />
                <span>Delete</span>
              </button>
            </div>
          )}
          <button
            onClick={handleUpload}
            className="btn-primary flex items-center space-x-2"
          >
            <UploadIcon size={20} />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      {/* Simplified Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
            >
              <GridIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Simplified Filter Tabs */}
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

      {/* Selection Controls */}
      {filteredAndSortedImages.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {selectedImages.size === filteredAndSortedImages.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-600">
            {filteredAndSortedImages.length} photos
          </span>
        </div>
      )}

      {/* Drag Overlay */}
      {dragOver && (
        <div className="fixed inset-0 bg-primary-500 bg-opacity-20 border-4 border-dashed border-primary-500 z-50 flex items-center justify-center">
          <div className="text-center text-primary-700">
            <UploadIcon size={48} className="mx-auto mb-4" />
            <p className="text-xl font-semibold">Drop images here to upload</p>
          </div>
        </div>
      )}

      {/* Image Grid/List */}
      {filteredAndSortedImages.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          : "space-y-2"
        }>
          {filteredAndSortedImages.map((image) => (
            <div
              key={image.id}
              className={`relative group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 ${
                selectedImages.has(image.id) ? 'ring-2 ring-primary-500' : ''
              } ${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''}`}
              onClick={() => handleImageClick(image)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleImageSelect(image.id, e.target.checked);
                        }}
                        className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                    {image.location && (
                      <div className="absolute top-2 right-2">
                        <MapPinIcon size={16} className="text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 truncate">
                      {image.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(image.timestamp).toLocaleDateString()}
                    </p>
                    {image.fileSize && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(image.fileSize)}
                      </p>
                    )}
                    {image.relatedName && (
                      <p className="text-xs text-primary-600 mt-1">
                        {image.relatedName}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {image.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </span>
                      {image.fileSize && (
                        <span className="text-xs text-gray-400">
                          {formatFileSize(image.fileSize)}
                        </span>
                      )}
                      <span className="text-xs text-primary-600 capitalize">
                        {image.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleImageSelect(image.id, e.target.checked);
                      }}
                      className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500"
                    />
                    <EyeIcon size={16} className="text-gray-400" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No photos found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? `No photos match "${searchQuery}"`
              : activeFilter === 'all' 
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

      {/* Simplified Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b bg-white">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold truncate">{selectedImage.title}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.url;
                    link.download = selectedImage.title;
                    link.click();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Download"
                >
                  <DownloadIcon size={20} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedImage.title,
                        text: selectedImage.description,
                        url: selectedImage.url
                      });
                    } else {
                      navigator.clipboard.writeText(selectedImage.url);
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Share"
                >
                  <ShareIcon size={20} />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <XIcon size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Display */}
              <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Image Info Panel */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-white overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Image Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="text-gray-800">{selectedImage.title}</span>
                      </div>
                      {selectedImage.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span className="text-gray-800">{selectedImage.description}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-800 capitalize">{selectedImage.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-800">{new Date(selectedImage.timestamp).toLocaleString()}</span>
                      </div>
                      {selectedImage.fileSize && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="text-gray-800">{formatFileSize(selectedImage.fileSize)}</span>
                        </div>
                      )}
                      {selectedImage.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="text-gray-800">{selectedImage.dimensions.width} × {selectedImage.dimensions.height}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedImage.location && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                      <div className="space-y-2 text-sm">
                        {selectedImage.location.name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="text-gray-800">{selectedImage.location.name}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coordinates:</span>
                          <span className="text-gray-800 font-mono text-xs">
                            {selectedImage.location.lat.toFixed(4)}, {selectedImage.location.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedImage.relatedName && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Related Resource</h3>
                      <p className="text-sm text-primary-600">{selectedImage.relatedName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Photos</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon size={24} />
              </button>
            </div>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your photos here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports JPG, PNG, GIF, WebP (max 10MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(Array.from(e.target.files));
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Choose Photos
              </button>
            </div>


            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary"
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
