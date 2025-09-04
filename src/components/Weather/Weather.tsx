import React, { useState, useEffect } from 'react';
import { 
  SunIcon, 
  CloudIcon, 
  CloudRainIcon, 
  CloudSnowIcon, 
  WindIcon, 
  DropletIcon, 
  ThermometerIcon,
  EyeIcon,
  GaugeIcon,
  SunriseIcon,
  SunsetIcon,
  RefreshCwIcon
} from 'lucide-react';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    wind: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    feelsLike: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    wind: number;
  }>;
  alerts?: Array<{
    type: 'warning' | 'watch' | 'advisory';
    title: string;
    description: string;
    expires: string;
  }>;
}

export const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Simulate fetching weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock weather data
      const mockWeather: WeatherData = {
        current: {
          temp: 72,
          condition: 'Partly Cloudy',
          icon: 'cloud-sun',
          humidity: 65,
          wind: 8,
          pressure: 30.15,
          visibility: 10,
          uvIndex: 6,
          feelsLike: 75
        },
        forecast: [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            high: 78,
            low: 58,
            condition: 'Sunny',
            icon: 'sun',
            precipitation: 0,
            wind: 6
          },
          {
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            high: 82,
            low: 62,
            condition: 'Partly Cloudy',
            icon: 'cloud-sun',
            precipitation: 10,
            wind: 7
          },
          {
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            high: 75,
            low: 55,
            condition: 'Rain',
            icon: 'cloud-rain',
            precipitation: 80,
            wind: 12
          },
          {
            date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            high: 68,
            low: 48,
            condition: 'Cloudy',
            icon: 'cloud',
            precipitation: 30,
            wind: 9
          },
          {
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            high: 71,
            low: 51,
            condition: 'Sunny',
            icon: 'sun',
            precipitation: 0,
            wind: 5
          }
        ],
        alerts: [
          {
            type: 'advisory',
            title: 'Heat Advisory',
            description: 'High temperatures expected. Ensure adequate water for livestock.',
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      setWeather(mockWeather);
      setLastUpdated(new Date());
      setLoading(false);
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (icon: string, size: number = 24) => {
    switch (icon) {
      case 'sun':
        return <SunIcon size={size} className="text-yellow-500" />;
      case 'cloud-sun':
        return <CloudIcon size={size} className="text-blue-500" />;
      case 'cloud':
        return <CloudIcon size={size} className="text-gray-500" />;
      case 'cloud-rain':
        return <CloudRainIcon size={size} className="text-blue-600" />;
      case 'cloud-snow':
        return <CloudSnowIcon size={size} className="text-blue-300" />;
      default:
        return <SunIcon size={size} className="text-yellow-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'watch':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'advisory':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const refreshWeather = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  if (loading && !weather) {
    return (
      <div className="pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary-800">Weather</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCwIcon className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Weather</h1>
          <p className="text-gray-600">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={refreshWeather}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCwIcon size={20} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {weather && (
        <>
          {/* Weather Alerts */}
          {weather.alerts && weather.alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {weather.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
                >
                  <h3 className="font-semibold mb-1">{alert.title}</h3>
                  <p className="text-sm mb-2">{alert.description}</p>
                  <p className="text-xs opacity-75">
                    Expires: {new Date(alert.expires).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Current Weather */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Current Conditions</h2>
              <div className="flex items-center space-x-2">
                {getWeatherIcon(weather.current.icon, 32)}
                <span className="text-lg font-medium text-gray-700">
                  {weather.current.condition}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-1">
                  {weather.current.temp}°F
                </div>
                <div className="text-sm text-gray-600">Temperature</div>
                <div className="text-xs text-gray-500">
                  Feels like {weather.current.feelsLike}°F
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DropletIcon size={20} className="text-blue-500 mr-1" />
                  <span className="text-lg font-semibold">{weather.current.humidity}%</span>
                </div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <WindIcon size={20} className="text-gray-500 mr-1" />
                  <span className="text-lg font-semibold">{weather.current.wind} mph</span>
                </div>
                <div className="text-sm text-gray-600">Wind Speed</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <GaugeIcon size={20} className="text-purple-500 mr-1" />
                  <span className="text-lg font-semibold">{weather.current.pressure}"</span>
                </div>
                <div className="text-sm text-gray-600">Pressure</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <EyeIcon size={16} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Visibility: {weather.current.visibility} mi
                </span>
              </div>
              <div className="flex items-center">
                <ThermometerIcon size={16} className="text-orange-500 mr-2" />
                <span className="text-sm text-gray-600">
                  UV Index: {weather.current.uvIndex}
                </span>
              </div>
              <div className="flex items-center">
                <SunriseIcon size={16} className="text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Sunrise: 6:45 AM
                </span>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5-Day Forecast</h2>
            <div className="space-y-3">
              {weather.forecast.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-center">
                      <div className="text-sm font-medium text-gray-800">
                        {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getWeatherIcon(day.icon, 24)}
                      <span className="text-sm text-gray-700">{day.condition}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Precip</div>
                      <div className="text-xs font-medium">{day.precipitation}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Wind</div>
                      <div className="text-xs font-medium">{day.wind} mph</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-800">
                        {day.high}°/{day.low}°
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farming Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Farming Recommendations</h2>
            <div className="space-y-3">
              {weather.current.temp > 80 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-medium text-orange-800 mb-1">Heat Advisory</h3>
                  <p className="text-sm text-orange-700">
                    High temperatures expected. Ensure adequate water and shade for livestock.
                  </p>
                </div>
              )}
              
              {weather.forecast.some(day => day.precipitation > 50) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1">Rain Expected</h3>
                  <p className="text-sm text-blue-700">
                    Plan indoor activities and check drainage systems.
                  </p>
                </div>
              )}
              
              {weather.current.wind > 15 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-1">High Winds</h3>
                  <p className="text-sm text-yellow-700">
                    Secure loose items and avoid outdoor spraying activities.
                  </p>
                </div>
              )}
              
              {weather.current.uvIndex > 7 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-1">High UV Index</h3>
                  <p className="text-sm text-red-700">
                    Protect yourself with sunscreen and appropriate clothing during outdoor work.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
