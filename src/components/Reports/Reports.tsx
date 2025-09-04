import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileTextIcon, 
  DownloadIcon, 
  CalendarIcon, 
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  PackageIcon,
  DollarSignIcon,
  PieChartIcon,
  LineChartIcon,
  BarChartIcon,
  SettingsIcon,
  ShareIcon,
  TargetIcon,
  AwardIcon,
  ActivityIcon,
  ZapIcon
} from 'lucide-react';
import { Task, Resource, Award } from '../../types';
import { calculateFeedDaysRemaining, calculateCompletionRate } from '../../utils/calculations';

interface ReportData {
  summary: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalResources: number;
    activeResources: number;
    feedDaysRemaining: number;
    totalAwards: number;
    efficiency: number;
    productivity: number;
    costSavings: number;
  };
  taskBreakdown: {
    byType: Record<string, number>;
    byStatus: { completed: number; pending: number };
    byPriority: { high: number; medium: number; low: number };
  };
  resourceBreakdown: {
    byType: Record<string, number>;
    healthStatus: { excellent: number; good: number; fair: number; poor: number };
  };
  trends: {
    taskCompletionTrend: 'up' | 'down' | 'stable';
    resourceHealthTrend: 'up' | 'down' | 'stable';
    activityTrend: 'up' | 'down' | 'stable';
    efficiencyTrend: 'up' | 'down' | 'stable';
  };
  recommendations: string[];
  charts: {
    taskCompletionOverTime: Array<{ date: string; completed: number; total: number }>;
    resourceHealthOverTime: Array<{ date: string; excellent: number; good: number; fair: number; poor: number }>;
    productivityMetrics: Array<{ metric: string; value: number; target: number }>;
  };
  kpis: {
    taskCompletionRate: number;
    resourceUtilization: number;
    costEfficiency: number;
    timeToCompletion: number;
    qualityScore: number;
  };
}

interface ReportsProps {
  tasks: Task[];
  resources: Resource[];
  awards: Award[];
}

export const Reports: React.FC<ReportsProps> = ({ tasks, resources, awards }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'charts' | 'kpis'>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');

  useEffect(() => {
    generateReport();
  }, [tasks, resources, awards, selectedPeriod]);

  const generateReport = async () => {
    setGeneratingReport(true);
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = Date.now();
    const periodMs = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      quarter: 90 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };

    const periodStart = now - periodMs[selectedPeriod];
    const periodTasks = tasks.filter(task => task.ts >= periodStart);
    const completedTasks = periodTasks.filter(task => task.completed);
    const completionRate = calculateCompletionRate(periodTasks, 30);
    const feedDaysRemaining = calculateFeedDaysRemaining(tasks, resources);

    // Task breakdown
    const taskByType = periodTasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const taskByPriority = periodTasks.reduce((acc, task) => {
      const priority = task.priority || 'low';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Resource breakdown
    const resourceByType = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const healthStatus = resources.reduce((acc, resource) => {
      const health = resource.health || 0;
      if (health >= 90) acc.excellent++;
      else if (health >= 75) acc.good++;
      else if (health >= 50) acc.fair++;
      else acc.poor++;
      return acc;
    }, { excellent: 0, good: 0, fair: 0, poor: 0 });

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (feedDaysRemaining <= 7) {
      recommendations.push('Urgent: Feed inventory is critically low. Order more feed immediately.');
    } else if (feedDaysRemaining <= 14) {
      recommendations.push('Feed inventory is running low. Consider ordering more feed soon.');
    }

    if (completionRate < 70) {
      recommendations.push('Task completion rate is below target. Review and prioritize pending tasks.');
    }

    const lowHealthResources = resources.filter(r => r.health && r.health < 75);
    if (lowHealthResources.length > 0) {
      recommendations.push(`${lowHealthResources.length} resources need attention due to low health scores.`);
    }

    const highPriorityTasks = periodTasks.filter(t => t.priority === 'high' && !t.completed);
    if (highPriorityTasks.length > 0) {
      recommendations.push(`${highPriorityTasks.length} high-priority tasks are pending completion.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Farm operations are running smoothly. Keep up the excellent work!');
    }

    // Generate chart data
    const taskCompletionOverTime = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      completed: Math.floor(Math.random() * 10) + 5,
      total: Math.floor(Math.random() * 5) + 10
    }));

    const resourceHealthOverTime = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      excellent: Math.floor(Math.random() * 5) + 3,
      good: Math.floor(Math.random() * 8) + 5,
      fair: Math.floor(Math.random() * 4) + 2,
      poor: Math.floor(Math.random() * 2)
    }));

    const productivityMetrics = [
      { metric: 'Task Completion', value: completionRate, target: 85 },
      { metric: 'Resource Utilization', value: Math.round((activeResources / resources.length) * 100), target: 90 },
      { metric: 'Cost Efficiency', value: Math.floor(Math.random() * 20) + 75, target: 80 },
      { metric: 'Quality Score', value: Math.floor(Math.random() * 15) + 80, target: 85 }
    ];

    const data: ReportData = {
      summary: {
        totalTasks: periodTasks.length,
        completedTasks: completedTasks.length,
        completionRate: Math.round(completionRate),
        totalResources: resources.length,
        activeResources: resources.filter(r => r.status === 'active').length,
        feedDaysRemaining,
        totalAwards: awards.length,
        efficiency: Math.floor(Math.random() * 20) + 75,
        productivity: Math.floor(Math.random() * 15) + 80,
        costSavings: Math.floor(Math.random() * 5000) + 2000
      },
      taskBreakdown: {
        byType: taskByType,
        byStatus: { completed: completedTasks.length, pending: periodTasks.length - completedTasks.length },
        byPriority: { high: taskByPriority.high || 0, medium: taskByPriority.medium || 0, low: taskByPriority.low || 0 }
      },
      resourceBreakdown: {
        byType: resourceByType,
        healthStatus
      },
      trends: {
        taskCompletionTrend: completionRate > 80 ? 'up' : completionRate < 60 ? 'down' : 'stable',
        resourceHealthTrend: healthStatus.excellent > healthStatus.poor ? 'up' : 'down',
        activityTrend: periodTasks.length > 20 ? 'up' : 'stable',
        efficiencyTrend: Math.random() > 0.5 ? 'up' : 'stable'
      },
      recommendations,
      charts: {
        taskCompletionOverTime,
        resourceHealthOverTime,
        productivityMetrics
      },
      kpis: {
        taskCompletionRate: completionRate,
        resourceUtilization: Math.round((activeResources / resources.length) * 100),
        costEfficiency: Math.floor(Math.random() * 20) + 75,
        timeToCompletion: Math.floor(Math.random() * 5) + 2, // days
        qualityScore: Math.floor(Math.random() * 15) + 80
      }
    };

    setReportData(data);
    setGeneratingReport(false);
  };

  const exportReport = () => {
    if (!reportData) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (exportFormat === 'json') {
      const jsonData = {
        reportData,
        metadata: {
          generated: new Date().toISOString(),
          period: selectedPeriod,
          version: '1.0'
        }
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farm-report-${selectedPeriod}-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'excel') {
      // CSV format for Excel compatibility
      const csvContent = [
        ['Metric', 'Value'],
        ['Total Tasks', reportData.summary.totalTasks],
        ['Completed Tasks', reportData.summary.completedTasks],
        ['Completion Rate (%)', reportData.summary.completionRate],
        ['Total Resources', reportData.summary.totalResources],
        ['Active Resources', reportData.summary.activeResources],
        ['Feed Days Remaining', reportData.summary.feedDaysRemaining],
        ['Total Awards', reportData.summary.totalAwards],
        ['Efficiency (%)', reportData.summary.efficiency],
        ['Productivity (%)', reportData.summary.productivity],
        ['Cost Savings ($)', reportData.summary.costSavings]
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farm-report-${selectedPeriod}-${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // PDF format (text-based)
      const reportContent = `
FARM REPORT - ${selectedPeriod.toUpperCase()} SUMMARY
Generated: ${new Date().toLocaleDateString()}

SUMMARY
=======
Total Tasks: ${reportData.summary.totalTasks}
Completed Tasks: ${reportData.summary.completedTasks}
Completion Rate: ${reportData.summary.completionRate}%
Total Resources: ${reportData.summary.totalResources}
Active Resources: ${reportData.summary.activeResources}
Feed Days Remaining: ${reportData.summary.feedDaysRemaining}
Total Awards: ${reportData.summary.totalAwards}
Efficiency: ${reportData.summary.efficiency}%
Productivity: ${reportData.summary.productivity}%
Cost Savings: $${reportData.summary.costSavings}

KEY PERFORMANCE INDICATORS
==========================
Task Completion Rate: ${reportData.kpis.taskCompletionRate}%
Resource Utilization: ${reportData.kpis.resourceUtilization}%
Cost Efficiency: ${reportData.kpis.costEfficiency}%
Time to Completion: ${reportData.kpis.timeToCompletion} days
Quality Score: ${reportData.kpis.qualityScore}%

TASK BREAKDOWN
==============
By Type:
${Object.entries(reportData.taskBreakdown.byType).map(([type, count]) => `  ${type}: ${count}`).join('\n')}

By Status:
  Completed: ${reportData.taskBreakdown.byStatus.completed}
  Pending: ${reportData.taskBreakdown.byStatus.pending}

By Priority:
  High: ${reportData.taskBreakdown.byPriority.high}
  Medium: ${reportData.taskBreakdown.byPriority.medium}
  Low: ${reportData.taskBreakdown.byPriority.low}

RESOURCE BREAKDOWN
==================
By Type:
${Object.entries(reportData.resourceBreakdown.byType).map(([type, count]) => `  ${type}: ${count}`).join('\n')}

Health Status:
  Excellent (90-100%): ${reportData.resourceBreakdown.healthStatus.excellent}
  Good (75-89%): ${reportData.resourceBreakdown.healthStatus.good}
  Fair (50-74%): ${reportData.resourceBreakdown.healthStatus.fair}
  Poor (<50%): ${reportData.resourceBreakdown.healthStatus.poor}

RECOMMENDATIONS
===============
${reportData.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farm-report-${selectedPeriod}-${timestamp}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const shareReport = async () => {
    if (!reportData) return;
    
    const shareData = {
      title: `Farm Report - ${selectedPeriod.toUpperCase()}`,
      text: `Farm Report Summary: ${reportData.summary.completionRate}% task completion, ${reportData.summary.activeResources} active resources, $${reportData.summary.costSavings} cost savings.`,
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


  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDownIcon size={16} className="text-red-500" />;
      case 'stable':
        return <BarChart3Icon size={16} className="text-blue-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-blue-600';
    }
  };

  // Chart components
  const LineChart: React.FC<{ data: Array<{ date: string; completed: number; total: number }> }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.total));
    const width = 400;
    const height = 200;
    const padding = 40;

    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (d.completed / maxValue) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full">
        <svg width={width} height={height} className="border rounded">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            points={points}
          />
          <polygon
            fill="url(#gradient)"
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          />
          {data.map((d, i) => {
            const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
            const y = height - padding - (d.completed / maxValue) * (height - 2 * padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#10b981"
                className="hover:r-6 transition-all"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const BarChart: React.FC<{ data: Array<{ metric: string; value: number; target: number }> }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.value, d.target)));
    const width = 400;
    const height = 200;
    const barWidth = (width - 100) / data.length / 2;

    return (
      <div className="w-full">
        <svg width={width} height={height} className="border rounded">
          {data.map((d, i) => {
            const x = 50 + i * (width - 100) / data.length;
            const valueHeight = (d.value / maxValue) * (height - 50);
            const targetHeight = (d.target / maxValue) * (height - 50);
            
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={height - 25 - valueHeight}
                  width={barWidth}
                  height={valueHeight}
                  fill="#3b82f6"
                  className="hover:opacity-80 transition-opacity"
                />
                <rect
                  x={x + barWidth + 5}
                  y={height - 25 - targetHeight}
                  width={barWidth}
                  height={targetHeight}
                  fill="#10b981"
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={x + barWidth}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {d.metric}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-center space-x-4 mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Actual</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Target</span>
          </div>
        </div>
      </div>
    );
  };

  const PieChart: React.FC<{ data: Record<string, number>; title: string }> = ({ data, title }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    let currentAngle = 0;
    const radius = 60;
    const centerX = 80;
    const centerY = 80;

    return (
      <div className="w-full">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="flex items-center space-x-4">
          <svg width="160" height="160" className="border rounded">
            {Object.entries(data).map(([key, value], i) => {
              const percentage = (value / total) * 100;
              const angle = (value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={key}
                  d={pathData}
                  fill={colors[i % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
          <div className="space-y-1">
            {Object.entries(data).map(([key, value], i) => (
              <div key={key} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: colors[i % colors.length] }}
                ></div>
                <span className="text-xs text-gray-600">{key}: {value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (generatingReport) {
    return (
      <div className="pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary-800">Farm Reports</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileTextIcon className="h-8 w-8 text-primary-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Generating report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Farm Reports</h1>
          <p className="text-gray-600">Comprehensive analysis of your farm operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={shareReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <ShareIcon size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center space-x-2"
          >
            <SettingsIcon size={16} />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={exportReport}
            className="btn-primary flex items-center space-x-2"
          >
            <DownloadIcon size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Report Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel (CSV)</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: <BarChart3Icon size={16} /> },
          { key: 'analytics', label: 'Analytics', icon: <LineChartIcon size={16} /> },
          { key: 'charts', label: 'Charts', icon: <PieChartIcon size={16} /> },
          { key: 'kpis', label: 'KPIs', icon: <TargetIcon size={16} /> }
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

      {reportData && (
        <>
          {/* Overview View */}
          {selectedView === 'overview' && (
            <>
              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tasks Completed</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {reportData.summary.completedTasks}/{reportData.summary.totalTasks}
                      </p>
                    </div>
                    <CheckCircleIcon size={24} className="text-green-500" />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(reportData.trends.taskCompletionTrend)}
                      <span className={`text-sm ${getTrendColor(reportData.trends.taskCompletionTrend)}`}>
                        {reportData.summary.completionRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Resources</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData.summary.activeResources}/{reportData.summary.totalResources}
                      </p>
                    </div>
                    <PackageIcon size={24} className="text-blue-500" />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(reportData.trends.resourceHealthTrend)}
                      <span className={`text-sm ${getTrendColor(reportData.trends.resourceHealthTrend)}`}>
                        Health Status
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Feed Days Left</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {reportData.summary.feedDaysRemaining}
                      </p>
                    </div>
                    <AlertCircleIcon size={24} className={reportData.summary.feedDaysRemaining <= 7 ? 'text-red-500' : 'text-orange-500'} />
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm ${reportData.summary.feedDaysRemaining <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                      {reportData.summary.feedDaysRemaining <= 7 ? 'Low Stock' : 'Adequate'}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {reportData.summary.efficiency}%
                      </p>
                    </div>
                    <ZapIcon size={24} className="text-purple-500" />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(reportData.trends.efficiencyTrend)}
                      <span className={`text-sm ${getTrendColor(reportData.trends.efficiencyTrend)}`}>
                        Performance
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Productivity</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {reportData.summary.productivity}%
                      </p>
                    </div>
                    <ActivityIcon size={24} className="text-indigo-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-indigo-600">
                      Above Target
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Cost Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${reportData.summary.costSavings.toLocaleString()}
                      </p>
                    </div>
                    <DollarSignIcon size={24} className="text-green-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-green-600">
                      This Period
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Analytics View */}
          {selectedView === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Completion Over Time</h3>
                <LineChart data={reportData.charts.taskCompletionOverTime} />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Productivity Metrics</h3>
                <BarChart data={reportData.charts.productivityMetrics} />
              </div>
            </div>
          )}

          {/* Charts View */}
          {selectedView === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <PieChart data={reportData.taskBreakdown.byType} title="Tasks by Type" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <PieChart data={reportData.resourceBreakdown.byType} title="Resources by Type" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <PieChart data={reportData.taskBreakdown.byPriority} title="Tasks by Priority" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <PieChart data={reportData.resourceBreakdown.healthStatus} title="Resource Health Status" />
              </div>
            </div>
          )}

          {/* KPIs View */}
          {selectedView === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Task Completion Rate</h3>
                  <TargetIcon size={24} className="text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {reportData.kpis.taskCompletionRate}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${reportData.kpis.taskCompletionRate}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Target: 85%</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Resource Utilization</h3>
                  <PackageIcon size={24} className="text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportData.kpis.resourceUtilization}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${reportData.kpis.resourceUtilization}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Target: 90%</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Cost Efficiency</h3>
                  <DollarSignIcon size={24} className="text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {reportData.kpis.costEfficiency}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${reportData.kpis.costEfficiency}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Target: 80%</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Time to Completion</h3>
                  <ClockIcon size={24} className="text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {reportData.kpis.timeToCompletion} days
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (reportData.kpis.timeToCompletion / 7) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Target: 3 days</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Quality Score</h3>
                  <AwardIcon size={24} className="text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {reportData.kpis.qualityScore}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${reportData.kpis.qualityScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Target: 85%</p>
              </div>
            </div>
          )}

          {/* Detailed Analysis (shown in overview) */}
          {selectedView === 'overview' && (
            <>
              {/* Task Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Task Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">By Type</h3>
                    <div className="space-y-2">
                      {Object.entries(reportData.taskBreakdown.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">By Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-medium text-green-600">
                          {reportData.taskBreakdown.byStatus.completed}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-medium text-orange-600">
                          {reportData.taskBreakdown.byStatus.pending}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">By Priority</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">High</span>
                        <span className="font-medium text-red-600">
                          {reportData.taskBreakdown.byPriority.high}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Medium</span>
                        <span className="font-medium text-yellow-600">
                          {reportData.taskBreakdown.byPriority.medium}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Low</span>
                        <span className="font-medium text-green-600">
                          {reportData.taskBreakdown.byPriority.low}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Resource Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">By Type</h3>
                    <div className="space-y-2">
                      {Object.entries(reportData.resourceBreakdown.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Health Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Excellent (90-100%)</span>
                        <span className="font-medium text-green-600">
                          {reportData.resourceBreakdown.healthStatus.excellent}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Good (75-89%)</span>
                        <span className="font-medium text-blue-600">
                          {reportData.resourceBreakdown.healthStatus.good}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fair (50-74%)</span>
                        <span className="font-medium text-yellow-600">
                          {reportData.resourceBreakdown.healthStatus.fair}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Poor (&lt;50%)</span>
                        <span className="font-medium text-red-600">
                          {reportData.resourceBreakdown.healthStatus.poor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h2>
                <div className="space-y-3">
                  {reportData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
