import React from 'react';
import { Task, Resource } from '../../types';
interface ResourceUsageChartProps {
  tasks: Task[];
  resources: Resource[];
}
export const ResourceUsageChart: React.FC<ResourceUsageChartProps> = ({
  tasks,
  resources
}) => {
  // Calculate resource usage by counting tasks associated with each resource
  const resourceUsage = resources.reduce((acc, resource) => {
    acc[resource.id] = tasks.filter(task => task.resource_id === resource.id).length;
    return acc;
  }, {} as Record<string, number>);
  // Get top used resources
  const topResources = [...resources].filter(resource => resourceUsage[resource.id] > 0).sort((a, b) => resourceUsage[b.id] - resourceUsage[a.id]).slice(0, 5);
  // Calculate resource health averages by type
  const healthByType = resources.reduce((acc, resource) => {
    if (resource.health !== undefined) {
      if (!acc[resource.type]) {
        acc[resource.type] = {
          total: 0,
          count: 0
        };
      }
      acc[resource.type].total += resource.health;
      acc[resource.type].count += 1;
    }
    return acc;
  }, {} as Record<string, {
    total: number;
    count: number;
  }>);
  // Calculate averages
  const healthAverages = Object.entries(healthByType).map(([type, data]) => ({
    type,
    average: Math.round(data.total / data.count)
  }));
  // Get color for resource type
  const getResourceColor = (type: string): string => {
    switch (type) {
      case 'animal':
        return 'bg-amber-500';
      case 'field':
        return 'bg-green-500';
      case 'equipment':
        return 'bg-yellow-500';
      case 'feed':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  return <div className="space-y-4">
      {/* Top Used Resources */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600 mb-2">Most Used Resources</p>
        {topResources.length > 0 ? <div className="space-y-2">
            {topResources.map(resource => <div key={resource.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{resource.name}</span>
                  <span className="font-medium">
                    {resourceUsage[resource.id]} uses
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${getResourceColor(resource.type)} h-2 rounded-full`} style={{
              width: `${resourceUsage[resource.id] / resourceUsage[topResources[0].id] * 100}%`
            }}></div>
                </div>
              </div>)}
          </div> : <p className="text-center text-sm text-gray-500">
            No resource usage data yet
          </p>}
      </div>
      {/* Health Status By Type */}
      {healthAverages.length > 0 && <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-2">Average Health by Type</p>
          <div className="space-y-2">
            {healthAverages.map(item => <div key={item.type} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <span className="font-medium">{item.average}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.average >= 80 ? 'bg-green-500' : item.average >= 60 ? 'bg-yellow-500' : 'bg-red-500'} h-2 rounded-full`} style={{
              width: `${item.average}%`
            }}></div>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Resource Distribution */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600 mb-2">Resource Distribution</p>
        <div className="flex justify-around text-center pt-2">
          {['animal', 'field', 'equipment', 'feed'].map(type => {
          const count = resources.filter(r => r.type === type).length;
          return <div key={type} className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ${getResourceColor(type)} opacity-80 flex items-center justify-center text-white font-bold`}>
                  {count}
                </div>
                <p className="text-xs mt-1 text-gray-600">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
              </div>;
        })}
        </div>
      </div>
    </div>;
};