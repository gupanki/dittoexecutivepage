import * as React from "react";
import { DateRange } from "react-day-picker";
import { subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

import {
  generateMockData,
  calculateTestMetrics,
  filterDataByDateRange,
  filterDataByTestNames,
  TestExecution,
} from "@/lib/test-data";
import { DateRangePicker } from "@/components/date-range-picker";
import { TestNameFilter } from "@/components/test-name-filter";
import { ExecutiveKPICards } from "@/components/executive-kpi-cards";
import { ExecutiveCharts } from "@/components/executive-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Presentation, RefreshCw } from "lucide-react";

export default function ExecutiveDashboard() {
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

  // Executive Summary Statistics
  const executiveSummary = React.useMemo(() => {
    const totalRuns = currentMetrics.reduce((sum, m) => sum + m.totalRuns, 0);
    const totalCost = currentMetrics.reduce((sum, m) => sum + (m.averageCost * m.totalRuns), 0);
    const totalSuccessful = currentMetrics.reduce((sum, m) => sum + m.successfulRuns, 0);
    const overallSuccessRate = totalRuns > 0 ? (totalSuccessful / totalRuns) * 100 : 0;
    
    const previousTotalRuns = comparisonMetrics.reduce((sum, m) => sum + m.totalRuns, 0);
    const previousTotalCost = comparisonMetrics.reduce((sum, m) => sum + (m.averageCost * m.totalRuns), 0);
    const previousSuccessful = comparisonMetrics.reduce((sum, m) => sum + m.successfulRuns, 0);
    const previousSuccessRate = previousTotalRuns > 0 ? (previousSuccessful / previousTotalRuns) * 100 : 0;

    const qualityTrend = overallSuccessRate - previousSuccessRate;
    const costTrend = previousTotalCost > 0 ? ((totalCost - previousTotalCost) / previousTotalCost) * 100 : 0;

    // Risk Assessment
    const criticalTests = currentMetrics.filter(m => m.successRate < 0.7).length;
    const riskLevel = criticalTests > 2 ? "High" : criticalTests > 0 ? "Medium" : "Low";

    return {
      totalRuns,
      totalCost,
      overallSuccessRate,
      qualityTrend,
      costTrend,
      criticalTests,
      riskLevel,
      testsMonitored: currentMetrics.length,
    };
  }, [currentMetrics, comparisonMetrics]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "High": return <Badge variant="destructive">High Risk</Badge>;
      case "Medium": return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case "Low": return <Badge className="bg-success text-success-foreground">Low Risk</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Executive Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Test Quality & Cost Intelligence
              </h1>
              <p className="text-muted-foreground mt-1">
                Executive overview of testing performance, costs, and quality trends
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Presentation className="h-4 w-4 mr-2" />
                Present
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Reporting Period & Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Current Period
                </label>
                <DateRangePicker 
                  date={currentDateRange} 
                  onDateChange={setCurrentDateRange} 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Focus Areas (Optional)
                </label>
                <TestNameFilter
                  availableTests={availableTestNames}
                  selectedTests={selectedTestNames}
                  onSelectionChange={setSelectedTestNames}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {executiveSummary.overallSuccessRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Quality Score</div>
                <div className={`text-xs mt-1 ${executiveSummary.qualityTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {executiveSummary.qualityTrend >= 0 ? '+' : ''}{executiveSummary.qualityTrend.toFixed(1)}% vs previous
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  ${executiveSummary.totalCost.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Investment</div>
                <div className={`text-xs mt-1 ${executiveSummary.costTrend <= 0 ? 'text-success' : 'text-destructive'}`}>
                  {executiveSummary.costTrend >= 0 ? '+' : ''}{executiveSummary.costTrend.toFixed(1)}% vs previous
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {executiveSummary.testsMonitored}
                </div>
                <div className="text-sm text-muted-foreground">Test Scenarios</div>
                <div className="text-xs mt-1 text-muted-foreground">
                  {executiveSummary.totalRuns} total executions
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-2">
                  {getRiskBadge(executiveSummary.riskLevel)}
                </div>
                <div className="text-sm text-muted-foreground">Risk Level</div>
                <div className="text-xs mt-1 text-muted-foreground">
                  {executiveSummary.criticalTests} tests need attention
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <ExecutiveKPICards 
          metrics={currentMetrics}
          previousMetrics={comparisonMetrics}
        />

        {/* Charts and Analysis */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="overview">Business Overview</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ExecutiveCharts metrics={currentMetrics} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Highest quality and efficiency tests
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentMetrics
                      .sort((a, b) => b.successRate - a.successRate)
                      .slice(0, 5)
                      .map((metric, index) => (
                        <div key={metric.testName} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{metric.testName}</div>
                            <div className="text-sm text-muted-foreground">
                              {metric.totalRuns} runs • ${(metric.averageCost).toFixed(4)} avg
                            </div>
                          </div>
                          <Badge className="bg-success text-success-foreground">
                            {(metric.successRate * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Needs Attention</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tests requiring quality improvement
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentMetrics
                      .filter(m => m.successRate < 0.85)
                      .sort((a, b) => a.successRate - b.successRate)
                      .slice(0, 5)
                      .map((metric) => (
                        <div key={metric.testName} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{metric.testName}</div>
                            <div className="text-sm text-muted-foreground">
                              {metric.failedRuns} failures • {metric.totalRuns} total runs
                            </div>
                          </div>
                          <Badge variant="destructive">
                            {(metric.successRate * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                  {currentMetrics.filter(m => m.successRate < 0.85).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      🎉 All tests performing well!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Period Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comparing current period with baseline
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      Comparison Period
                    </label>
                    <DateRangePicker 
                      date={comparisonDateRange} 
                      onDateChange={setComparisonDateRange} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-card border rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {executiveSummary.qualityTrend >= 0 ? '+' : ''}{executiveSummary.qualityTrend.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Quality Change</div>
                    </div>
                    <div className="p-4 bg-card border rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {executiveSummary.costTrend >= 0 ? '+' : ''}{executiveSummary.costTrend.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Cost Change</div>
                    </div>
                    <div className="p-4 bg-card border rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {getRiskBadge(executiveSummary.riskLevel)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">Current Risk</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}