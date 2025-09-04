import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCwIcon,
  MapPinIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  BarChart3Icon,
  DownloadIcon,
  ShareIcon,
  SettingsIcon,
  ZapIcon,
  SnowflakeIcon,
  CloudLightningIcon,
  CloudDrizzleIcon,
  CloudFogIcon
} from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
  };
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    wind: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    feelsLike: number;
    dewPoint: number;
    cloudCover: number;
    sunrise: string;
    sunset: string;
  };
  hourly: Array<{
    time: string;
    temp: number;
    condition: string;
    icon: string;
    precipitation: number;
    wind: number;
    humidity: number;
  }>;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    wind: number;
    humidity: number;
    sunrise: string;
    sunset: string;
  }>;
  alerts?: Array<{
    type: 'warning' | 'watch' | 'advisory';
    title: string;
    description: string;
    expires: string;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  }>;
}

export const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedView, setSelectedView] = useState<'current' | 'hourly' | 'forecast'>('current');
  const [units, setUnits] = useState<'metric' | 'imperial'>('imperial');
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to demo location
          setLocation({
            lat: 40.7128,
            lng: -74.0060,
            name: 'Demo Farm Location'
          });
        }
      );
    } else {
      setLocation({
        lat: 40.7128,
        lng: -74.0060,
        name: 'Demo Farm Location'
      });
    }
  }, []);

  // Fetch weather data
  const fetchWeatherData = useCallback(async () => {
    if (!location) return;
    
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Enhanced mock weather data
    const mockWeather: WeatherData = {
      location: {
        name: location.name,
        coordinates: { lat: location.lat, lng: location.lng },
        timezone: 'America/New_York'
      },
      current: {
        temp: 72,
        condition: 'Partly Cloudy',
        icon: 'cloud-sun',
        humidity: 65,
        wind: 8,
        windDirection: 225,
        pressure: 30.15,
        visibility: 10,
        uvIndex: 6,
        feelsLike: 75,
        dewPoint: 58,
        cloudCover: 45,
        sunrise: '06:45',
        sunset: '19:30'
      },
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() + i * 60 * 60 * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        temp: 72 + Math.sin(i * 0.3) * 10 + Math.random() * 4 - 2,
        condition: ['sun', 'cloud-sun', 'cloud', 'cloud-rain'][Math.floor(Math.random() * 4)],
        icon: ['sun', 'cloud-sun', 'cloud', 'cloud-rain'][Math.floor(Math.random() * 4)],
        precipitation: Math.random() * 20,
        wind: 5 + Math.random() * 10,
        humidity: 60 + Math.random() * 20
      })),
      forecast: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          high: 78,
          low: 58,
          condition: 'Sunny',
          icon: 'sun',
          precipitation: 0,
          wind: 6,
          humidity: 55,
          sunrise: '06:44',
          sunset: '19:31'
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          high: 82,
          low: 62,
          condition: 'Partly Cloudy',
          icon: 'cloud-sun',
          precipitation: 10,
          wind: 7,
          humidity: 60,
          sunrise: '06:43',
          sunset: '19:32'
        },
        {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          high: 75,
          low: 55,
          condition: 'Rain',
          icon: 'cloud-rain',
          precipitation: 80,
          wind: 12,
          humidity: 85,
          sunrise: '06:42',
          sunset: '19:33'
        },
        {
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          high: 68,
          low: 48,
          condition: 'Cloudy',
          icon: 'cloud',
          precipitation: 30,
          wind: 9,
          humidity: 70,
          sunrise: '06:41',
          sunset: '19:34'
        },
        {
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          high: 71,
          low: 51,
          condition: 'Sunny',
          icon: 'sun',
          precipitation: 0,
          wind: 5,
          humidity: 50,
          sunrise: '06:40',
          sunset: '19:35'
        }
      ],
      alerts: [
        {
          type: 'advisory',
          title: 'Heat Advisory',
          description: 'High temperatures expected. Ensure adequate water for livestock.',
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'moderate'
        },
        {
          type: 'watch',
          title: 'Thunderstorm Watch',
          description: 'Severe thunderstorms possible this evening. Secure outdoor equipment.',
          expires: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          severity: 'minor'
        }
      ]
    };

    setWeather(mockWeather);
    setLastUpdated(new Date());
    setLoading(false);
  }, [location]);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location, fetchWeatherData]);


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
        return <SnowflakeIcon size={size} className="text-blue-300" />;
      case 'cloud-lightning':
        return <CloudLightningIcon size={size} className="text-purple-500" />;
      case 'cloud-drizzle':
        return <CloudDrizzleIcon size={size} className="text-blue-400" />;
      case 'cloud-fog':
        return <CloudFogIcon size={size} className="text-gray-400" />;
      default:
        return <SunIcon size={size} className="text-yellow-500" />;
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getUVIndexColor = (index: number) => {
    if (index <= 2) return 'text-green-600';
    if (index <= 5) return 'text-yellow-600';
    if (index <= 7) return 'text-orange-600';
    if (index <= 10) return 'text-red-600';
    return 'text-purple-600';
  };

  const getUVIndexDescription = (index: number) => {
    if (index <= 2) return 'Low';
    if (index <= 5) return 'Moderate';
    if (index <= 7) return 'High';
    if (index <= 10) return 'Very High';
    return 'Extreme';
  };

  const formatTemperature = (temp: number) => {
    return units === 'metric' ? `${Math.round((temp - 32) * 5/9)}°C` : `${Math.round(temp)}°F`;
  };

  const formatWindSpeed = (speed: number) => {
    return units === 'metric' ? `${Math.round(speed * 1.609)} km/h` : `${Math.round(speed)} mph`;
  };

  const formatPressure = (pressure: number) => {
    return units === 'metric' ? `${Math.round(pressure * 33.8639)} hPa` : `${pressure}" Hg`;
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'severe':
        return 'bg-orange-100 border-orange-400 text-orange-800';
      case 'extreme':
        return 'bg-red-100 border-red-400 text-red-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const refreshWeather = () => {
    fetchWeatherData();
  };

  const exportWeatherData = () => {
    if (!weather) return;
    
    const data = {
      location: weather.location,
      current: weather.current,
      forecast: weather.forecast,
      exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareWeather = async () => {
    if (!weather) return;
    
    const shareData = {
      title: `Weather at ${weather.location.name}`,
      text: `Current: ${weather.current.temp}°F, ${weather.current.condition}. ${weather.forecast[0]?.high}°F high today.`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
    }
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
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Weather</h1>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPinIcon size={16} />
            <span>{weather?.location.name}</span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={shareWeather}
            className="btn-secondary flex items-center space-x-2"
          >
            <ShareIcon size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={exportWeatherData}
            className="btn-secondary flex items-center space-x-2"
          >
            <DownloadIcon size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center space-x-2"
          >
            <SettingsIcon size={16} />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={refreshWeather}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCwIcon size={20} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Weather Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="imperial">Imperial (°F, mph)</option>
                <option value="metric">Metric (°C, km/h)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'current', label: 'Current', icon: <ThermometerIcon size={16} /> },
          { key: 'hourly', label: 'Hourly', icon: <BarChart3Icon size={16} /> },
          { key: 'forecast', label: '5-Day', icon: <CalendarIcon size={16} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedView(tab.key as any)}
            className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
              selectedView === tab.key
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {weather && (
        <>
          {/* Weather Alerts */}
          {weather.alerts && weather.alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {weather.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getAlertSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangleIcon size={20} className="mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{alert.title}</h3>
                      <p className="text-sm mb-2">{alert.description}</p>
                      <p className="text-xs opacity-75">
                        Expires: {new Date(alert.expires).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Weather View */}
          {selectedView === 'current' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Current Conditions</h2>
                <div className="flex items-center space-x-2">
                  {getWeatherIcon(weather.current.icon, 32)}
                  <span className="text-lg font-medium text-gray-700">
                    {weather.current.condition}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary-600 mb-2">
                    {formatTemperature(weather.current.temp)}
                  </div>
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="text-xs text-gray-500">
                    Feels like {formatTemperature(weather.current.feelsLike)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DropletIcon size={24} className="text-blue-500 mr-2" />
                    <span className="text-2xl font-semibold">{weather.current.humidity}%</span>
                  </div>
                  <div className="text-sm text-gray-600">Humidity</div>
                  <div className="text-xs text-gray-500">
                    Dew point {formatTemperature(weather.current.dewPoint)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <WindIcon size={24} className="text-gray-500 mr-2" />
                    <span className="text-2xl font-semibold">{formatWindSpeed(weather.current.wind)}</span>
                  </div>
                  <div className="text-sm text-gray-600">Wind Speed</div>
                  <div className="text-xs text-gray-500">
                    {getWindDirection(weather.current.windDirection)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <GaugeIcon size={24} className="text-purple-500 mr-2" />
                    <span className="text-2xl font-semibold">{formatPressure(weather.current.pressure)}</span>
                  </div>
                  <div className="text-sm text-gray-600">Pressure</div>
                  <div className="text-xs text-gray-500">
                    {weather.current.cloudCover}% cloud cover
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <EyeIcon size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Visibility: {weather.current.visibility} mi
                  </span>
                </div>
                <div className="flex items-center">
                  <ZapIcon size={16} className={`mr-2 ${getUVIndexColor(weather.current.uvIndex)}`} />
                  <span className={`text-sm ${getUVIndexColor(weather.current.uvIndex)}`}>
                    UV Index: {weather.current.uvIndex} ({getUVIndexDescription(weather.current.uvIndex)})
                  </span>
                </div>
                <div className="flex items-center">
                  <SunriseIcon size={16} className="text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Sunrise: {weather.current.sunrise}
                  </span>
                </div>
                <div className="flex items-center">
                  <SunsetIcon size={16} className="text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Sunset: {weather.current.sunset}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hourly Forecast View */}
          {selectedView === 'hourly' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">24-Hour Forecast</h2>
              <div className="overflow-x-auto">
                <div className="flex space-x-4 min-w-max">
                  {weather.hourly.slice(0, 12).map((hour, index) => (
                    <div key={index} className="flex-shrink-0 text-center">
                      <div className="text-sm text-gray-600 mb-2">{hour.time}</div>
                      <div className="mb-2">{getWeatherIcon(hour.icon, 24)}</div>
                      <div className="text-lg font-semibold text-gray-800 mb-1">
                        {formatTemperature(hour.temp)}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{hour.precipitation}%</div>
                      <div className="text-xs text-gray-500">{formatWindSpeed(hour.wind)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5-Day Forecast View */}
          {selectedView === 'forecast' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5-Day Forecast</h2>
              <div className="space-y-3">
                {weather.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 text-center">
                        <div className="text-sm font-medium text-gray-800">
                          {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getWeatherIcon(day.icon, 32)}
                        <div>
                          <div className="text-sm text-gray-700">{day.condition}</div>
                          <div className="text-xs text-gray-500">
                            {day.sunrise} - {day.sunset}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Precip</div>
                        <div className="text-sm font-medium">{day.precipitation}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Wind</div>
                        <div className="text-sm font-medium">{formatWindSpeed(day.wind)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Humidity</div>
                        <div className="text-sm font-medium">{day.humidity}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">
                          {formatTemperature(day.high)}/{formatTemperature(day.low)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Farming Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Farming Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weather.current.temp > 80 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangleIcon size={20} className="text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-800 mb-1">Heat Advisory</h3>
                      <p className="text-sm text-orange-700">
                        High temperatures expected. Ensure adequate water and shade for livestock.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {weather.forecast.some(day => day.precipitation > 50) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CloudRainIcon size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Rain Expected</h3>
                      <p className="text-sm text-blue-700">
                        Plan indoor activities and check drainage systems.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {weather.current.wind > 15 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <WindIcon size={20} className="text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-1">High Winds</h3>
                      <p className="text-sm text-yellow-700">
                        Secure loose items and avoid outdoor spraying activities.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {weather.current.uvIndex > 7 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <ZapIcon size={20} className="text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800 mb-1">High UV Index</h3>
                      <p className="text-sm text-red-700">
                        Protect yourself with sunscreen and appropriate clothing during outdoor work.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {weather.current.humidity > 80 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <DropletIcon size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800 mb-1">High Humidity</h3>
                      <p className="text-sm text-green-700">
                        Monitor for mold and fungal growth. Ensure proper ventilation in storage areas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {weather.current.temp < 32 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <SnowflakeIcon size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Freezing Conditions</h3>
                      <p className="text-sm text-blue-700">
                        Protect sensitive plants and ensure water sources don't freeze.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
