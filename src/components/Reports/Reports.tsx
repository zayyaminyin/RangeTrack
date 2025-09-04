import React, { useState, useEffect } from 'react';
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
  UsersIcon,
  DollarSignIcon
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
  };
  recommendations: string[];
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

    const data: ReportData = {
      summary: {
        totalTasks: periodTasks.length,
        completedTasks: completedTasks.length,
        completionRate: Math.round(completionRate),
        totalResources: resources.length,
        activeResources: resources.filter(r => r.status === 'active').length,
        feedDaysRemaining,
        totalAwards: awards.length
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
        activityTrend: periodTasks.length > 20 ? 'up' : 'stable'
      },
      recommendations
    };

    setReportData(data);
    setGeneratingReport(false);
  };

  const exportReport = () => {
    if (!reportData) return;

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
    a.download = `farm-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Farm Reports</h1>
          <p className="text-gray-600">Comprehensive analysis of your farm operations</p>
        </div>
        <div className="flex items-center space-x-3">
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
            onClick={exportReport}
            className="btn-primary flex items-center space-x-2"
          >
            <DownloadIcon size={20} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  <p className="text-sm text-gray-600">Awards Earned</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reportData.summary.totalAwards}
                  </p>
                </div>
                <CheckCircleIcon size={24} className="text-yellow-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center space-x-1">
                  {getTrendIcon(reportData.trends.activityTrend)}
                  <span className={`text-sm ${getTrendColor(reportData.trends.activityTrend)}`}>
                    Activity Level
                  </span>
                </div>
              </div>
            </div>
          </div>

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
    </div>
  );
};
