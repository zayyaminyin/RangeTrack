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
  // Calculate health statuses
  const animalHealth = calculateAverageHealth(resourcesByType.animal);
  const equipmentHealth = calculateAverageHealth(resourcesByType.equipment);
  const metricCards = [{
    type: 'animal' as ResourceType,
    label: 'Animals',
    count: totalCounts.animal,
    health: animalHealth,
    icon: <BirdIcon className="text-amber-600" size={20} />
  }, {
    type: 'field' as ResourceType,
    label: 'Fields',
    count: totalCounts.field,
    icon: <TreesIcon className="text-green-600" size={20} />
  }, {
    type: 'equipment' as ResourceType,
    label: 'Equipment',
    count: totalCounts.equipment,
    health: equipmentHealth,
    icon: <TractorIcon className="text-yellow-600" size={20} />
  }, {
    type: 'feed' as ResourceType,
    label: 'Feed',
    count: totalCounts.feed,
    icon: <WheatIcon className="text-amber-600" size={20} />
  }];
  return <div className="grid grid-cols-2 gap-3">
      {metricCards.map(card => <div key={card.type} className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mr-3">
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-600">{card.label}</p>
              <p className="text-xl font-bold">{card.count}</p>
            </div>
          </div>
          {card.health !== undefined && <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Health</span>
                <span className="text-xs font-medium">{card.health}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${getHealthColor(card.health)}`} style={{
            width: `${card.health}%`
          }}></div>
              </div>
            </div>}
        </div>)}
    </div>;
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
  if (health >= 80) return 'bg-green-500';
  if (health >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};