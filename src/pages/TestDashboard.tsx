import * as React from "react";
import { DateRange } from "react-day-picker";
import { subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

import {
  generateMockData,
  calculateTestMetrics,
  generateTimelineData,
  filterDataByDateRange,
  filterDataByTestNames,
  TestExecution,
} from "@/lib/test-data";
import { DateRangePicker } from "@/components/date-range-picker";
import { TestNameFilter } from "@/components/test-name-filter";
import { TestMetricsTable } from "@/components/test-metrics-table";
import { TimelineChart } from "@/components/timeline-chart";
import { ComparisonView } from "@/components/comparison-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function TestDashboard() {
  const [allData] = React.useState<TestExecution[]>(() => generateMockData());
  
  const [currentDateRange, setCurrentDateRange] = React.useState<DateRange | undefined>(() => ({
    from: subDays(new Date(), 29),
    to: new Date(),
  }));
  
  const [comparisonDateRange, setComparisonDateRange] = React.useState<DateRange | undefined>(() => {
    const lastMonth = subMonths(new Date(), 1);
    return {
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
    };
  });
  
  const [selectedTestNames, setSelectedTestNames] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState("overview");

  // Get unique test names
  const availableTestNames = React.useMemo(() => {
    return Array.from(new Set(allData.map(test => test.testName))).sort();
  }, [allData]);

  // Filter data based on current selections
  const filteredCurrentData = React.useMemo(() => {
    let filtered = allData;
    
    if (currentDateRange?.from && currentDateRange?.to) {
      filtered = filterDataByDateRange(filtered, currentDateRange.from, currentDateRange.to);
    }
    
    if (selectedTestNames.length > 0) {
      filtered = filterDataByTestNames(filtered, selectedTestNames);
    }
    
    return filtered;
  }, [allData, currentDateRange, selectedTestNames]);

  // Filter comparison data
  const filteredComparisonData = React.useMemo(() => {
    let filtered = allData;
    
    if (comparisonDateRange?.from && comparisonDateRange?.to) {
      filtered = filterDataByDateRange(filtered, comparisonDateRange.from, comparisonDateRange.to);
    }
    
    if (selectedTestNames.length > 0) {
      filtered = filterDataByTestNames(filtered, selectedTestNames);
    }
    
    return filtered;
  }, [allData, comparisonDateRange, selectedTestNames]);

  // Calculate metrics
  const currentMetrics = React.useMemo(() => 
    calculateTestMetrics(filteredCurrentData), 
    [filteredCurrentData]
  );
  
  const comparisonMetrics = React.useMemo(() => 
    calculateTestMetrics(filteredComparisonData), 
    [filteredComparisonData]
  );

  // Generate timeline data
  const timelineData = React.useMemo(() => 
    generateTimelineData(filteredCurrentData), 
    [filteredCurrentData]
  );

  // Summary statistics
  const summaryStats = React.useMemo(() => {
    const totalRuns = currentMetrics.reduce((sum, m) => sum + m.totalRuns, 0);
    const totalCost = currentMetrics.reduce((sum, m) => sum + (m.averageCost * m.totalRuns), 0);
    const totalSuccessful = currentMetrics.reduce((sum, m) => sum + m.successfulRuns, 0);
    const totalFailed = currentMetrics.reduce((sum, m) => sum + m.failedRuns, 0);
    const overallSuccessRate = totalRuns > 0 ? totalSuccessful / totalRuns : 0;
    const averageCost = totalRuns > 0 ? totalCost / totalRuns : 0;

    return {
      totalRuns,
      totalCost,
      averageCost,
      overallSuccessRate,
      totalSuccessful,
      totalFailed,
      uniqueTests: currentMetrics.length,
    };
  }, [currentMetrics]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Execution Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor test performance, costs, and trends across your test suite
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DateRangePicker 
                date={currentDateRange} 
                onDateChange={setCurrentDateRange} 
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Test Names</label>
              <TestNameFilter
                availableTests={availableTestNames}
                selectedTests={selectedTestNames}
                onSelectionChange={setSelectedTestNames}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                Across {summaryStats.uniqueTests} test{summaryStats.uniqueTests !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summaryStats.overallSuccessRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.totalSuccessful} successful, {summaryStats.totalFailed} failed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryStats.averageCost.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground">Per test execution</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryStats.totalCost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">For selected period</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TimelineChart data={timelineData} />
            
            <Card>
              <CardHeader>
                <CardTitle>Test Metrics Summary</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {currentMetrics.length} test{currentMetrics.length !== 1 ? 's' : ''}
                  </Badge>
                  {selectedTestNames.length > 0 && (
                    <Badge variant="outline">
                      Filtered by {selectedTestNames.length} test name{selectedTestNames.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <TestMetricsTable metrics={currentMetrics} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Comparison Period</label>
                <DateRangePicker 
                  date={comparisonDateRange} 
                  onDateChange={setComparisonDateRange} 
                />
              </div>
            </div>
            
            <ComparisonView
              currentMetrics={currentMetrics}
              previousMetrics={comparisonMetrics}
              currentRange={currentDateRange}
              previousRange={comparisonDateRange}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Test Metrics with Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Changes shown relative to comparison period
                </p>
              </CardHeader>
              <CardContent>
                <TestMetricsTable 
                  metrics={currentMetrics} 
                  comparisonMetrics={comparisonMetrics}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <TimelineChart data={timelineData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Peak Daily Runs</div>
                      <div className="text-xl font-semibold">
                        {Math.max(...timelineData.map(d => d.runs), 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Daily Runs</div>
                      <div className="text-xl font-semibold">
                        {timelineData.length > 0 
                          ? Math.round(timelineData.reduce((sum, d) => sum + d.runs, 0) / timelineData.length)
                          : 0
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Best Success Rate</div>
                      <div className="text-xl font-semibold">
                        {timelineData.length > 0 
                          ? (Math.max(...timelineData.map(d => d.successRate)) * 100).toFixed(1)
                          : 0
                        }%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Active Days</div>
                      <div className="text-xl font-semibold">
                        {timelineData.filter(d => d.runs > 0).length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Highest Daily Cost</div>
                      <div className="text-xl font-semibold">
                        ${timelineData.length > 0 
                          ? Math.max(...timelineData.map(d => d.averageCost)).toFixed(4)
                          : '0.0000'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lowest Daily Cost</div>
                      <div className="text-xl font-semibold">
                        ${timelineData.length > 0 
                          ? Math.min(...timelineData.map(d => d.averageCost)).toFixed(4)
                          : '0.0000'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}