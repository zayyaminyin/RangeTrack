import React from 'react';
import { Resource, ResourceType } from '../../types';
import { TreesIcon, TractorIcon, WheatIcon, BirdIcon } from 'lucide-react';
interface MetricCardsProps {
  resources: Resource[];
}
export const MetricCards: React.FC<MetricCardsProps> = ({
  resources
}) => {
  // Group resources by type
  const resourcesByType: Record<ResourceType, Resource[]> = {
    animal: resources.filter(r => r.type === 'animal'),
    field: resources.filter(r => r.type === 'field'),
    equipment: resources.filter(r => r.type === 'equipment'),
    feed: resources.filter(r => r.type === 'feed')
  };
  // Calculate total quantities for each type
  const totalCounts = {
    animal: resourcesByType.animal.reduce((sum, r) => sum + (r.quantity || 0), 0),
    field: resourcesByType.field.length,
    equipment: resourcesByType.equipment.length,
    feed: resourcesByType.feed.reduce((sum, r) => sum + (r.quantity || 0), 0)
  };
  // Calculate property values for each resource type
  const animalHealth = calculateAverageHealth(resourcesByType.animal);
  const equipmentCondition = calculateAverageHealth(resourcesByType.equipment);
  const fieldFertility = calculateAverageHealth(resourcesByType.field);
  const feedQuality = calculateAverageHealth(resourcesByType.feed);
  
  const metricCards = [{
    type: 'animal' as ResourceType,
    label: 'Animals',
    count: totalCounts.animal,
    propertyValue: animalHealth,
    propertyLabel: 'Health',
    icon: <BirdIcon className="text-amber-600" size={20} />
  }, {
    type: 'field' as ResourceType,
    label: 'Fields',
    count: totalCounts.field,
    propertyValue: fieldFertility,
    propertyLabel: 'Fertility',
    icon: <TreesIcon className="text-green-600" size={20} />
  }, {
    type: 'equipment' as ResourceType,
    label: 'Equipment',
    count: totalCounts.equipment,
    propertyValue: equipmentCondition,
    propertyLabel: 'Condition',
    icon: <TractorIcon className="text-yellow-600" size={20} />
  }, {
    type: 'feed' as ResourceType,
    label: 'Feed',
    count: totalCounts.feed,
    propertyValue: feedQuality,
    propertyLabel: 'Quality',
    icon: <WheatIcon className="text-amber-600" size={20} />
  }];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricCards.map(card => (
        <div key={card.type} className="card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200">
                {card.icon}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.count}</p>
              </div>
            </div>
            
            {card.propertyValue !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600 font-medium">{card.propertyLabel}</span>
                  <span className={`text-sm font-bold ${getHealthColorText(card.propertyValue)}`}>
                    {card.propertyValue}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getHealthColor(card.propertyValue)}`} 
                    style={{ width: `${card.propertyValue}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
// Helper function to calculate average health of resources
const calculateAverageHealth = (resources: Resource[]): number | undefined => {
  if (resources.length === 0 || !resources.some(r => r.health !== undefined)) {
    return undefined;
  }
  const resourcesWithHealth = resources.filter(r => r.health !== undefined);
  const totalHealth = resourcesWithHealth.reduce((sum, r) => sum + (r.health || 0), 0);
  return Math.round(totalHealth / resourcesWithHealth.length);
};
// Helper function to get health indicator color
const getHealthColor = (health: number): string => {
  if (health >= 80) return 'bg-primary-500';
  if (health >= 60) return 'bg-accent-500';
  return 'bg-red-500';
};

// Helper function to get health text color
const getHealthColorText = (health: number): string => {
  if (health >= 80) return 'text-primary-600';
  if (health >= 60) return 'text-accent-600';
  return 'text-red-600';
};