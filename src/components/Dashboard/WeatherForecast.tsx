import React from 'react';
import { SunIcon, CloudRainIcon, CloudIcon, CloudDrizzleIcon, CloudLightningIcon } from 'lucide-react';
// Mock data for the weather forecast
const forecastData = [{
  day: 'Today',
  temp: 72,
  icon: 'sun',
  condition: 'Sunny'
}, {
  day: 'Wed',
  temp: 68,
  icon: 'cloud',
  condition: 'Cloudy'
}, {
  day: 'Thu',
  temp: 65,
  icon: 'cloud-rain',
  condition: 'Rain'
}, {
  day: 'Fri',
  temp: 70,
  icon: 'cloud-drizzle',
  condition: 'Drizzle'
}, {
  day: 'Sat',
  temp: 75,
  icon: 'sun',
  condition: 'Sunny'
}];
export const WeatherForecast: React.FC = () => {
  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'cloud-rain':
        return <CloudRainIcon size={24} className="text-blue-500" />;
      case 'cloud':
        return <CloudIcon size={24} className="text-gray-500" />;
      case 'cloud-drizzle':
        return <CloudDrizzleIcon size={24} className="text-blue-400" />;
      case 'cloud-lightning':
        return <CloudLightningIcon size={24} className="text-yellow-500" />;
      default:
        return <SunIcon size={24} className="text-yellow-500" />;
    }
  };
  return <div className="p-3 bg-white">
      <div className="flex justify-between">
        {forecastData.map((day, index) => <div key={index} className="flex flex-col items-center">
            <p className="text-xs font-medium text-gray-600">{day.day}</p>
            <div className="my-2">{getWeatherIcon(day.icon)}</div>
            <p className="text-sm font-bold">{day.temp}°F</p>
            <p className="text-xs text-gray-500">{day.condition}</p>
          </div>)}
      </div>
    </div>;
};