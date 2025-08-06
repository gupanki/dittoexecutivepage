import * as React from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

import {
  generateMockData,
  calculateTestMetrics,
  filterDataByDateRange,
  TestExecution,
} from "@/lib/test-data";
import { DateRangePicker } from "@/components/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

export default function SimpleDashboard() {
  const [allData] = React.useState<TestExecution[]>(() => generateMockData());
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => ({
    from: subDays(new Date(), 7),
    to: new Date(),
  }));

  // Filter data
  const filteredData = React.useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return filterDataByDateRange(allData, dateRange.from, dateRange.to);
    }
    return allData;
  }, [allData, dateRange]);

  // Calculate simple metrics
  const metrics = React.useMemo(() => {
    const totalRuns = filteredData.length;
    const successful = filteredData.filter(test => test.successRate > 0.5).length;
    const failed = totalRuns - successful;
    const successRate = totalRuns > 0 ? (successful / totalRuns) * 100 : 0;
    const totalCost = filteredData.reduce((sum, test) => sum + test.cost, 0);
    const avgDuration = totalRuns > 0 ? filteredData.reduce((sum, test) => sum + test.duration, 0) / totalRuns : 0;

    return {
      totalRuns,
      successful,
      failed,
      successRate,
      totalCost,
      avgDuration,
    };
  }, [filteredData]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return "text-success";
    if (rate >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Test Results</h1>
          <p className="text-muted-foreground">Simple overview of test performance</p>
        </div>

        {/* Date Filter */}
        <div className="flex justify-center">
          <div className="w-80">
            <DateRangePicker 
              date={dateRange} 
              onDateChange={setDateRange} 
            />
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto mb-2">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-3xl font-bold text-success">
                {metrics.successful}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Successful Tests</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto mb-2">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-3xl font-bold text-destructive">
                {metrics.failed}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Failed Tests</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto mb-2">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">
                {formatDuration(metrics.avgDuration)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Average Duration</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto mb-2">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">
                ${metrics.totalCost.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Total Cost</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Rate */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">
              <span className={getStatusColor(metrics.successRate)}>
                {metrics.successRate.toFixed(1)}%
              </span>
            </CardTitle>
            <p className="text-muted-foreground">Overall Success Rate</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center">
              {metrics.successRate >= 90 && (
                <Badge className="bg-success text-success-foreground">Excellent</Badge>
              )}
              {metrics.successRate >= 70 && metrics.successRate < 90 && (
                <Badge className="bg-warning text-warning-foreground">Good</Badge>
              )}
              {metrics.successRate < 70 && (
                <Badge variant="destructive">Needs Attention</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {metrics.totalRuns} total test runs in selected period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}