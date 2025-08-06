import * as React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { TestMetrics } from "@/lib/test-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ComparisonViewProps {
  currentMetrics: TestMetrics[];
  previousMetrics: TestMetrics[];
  currentRange: DateRange | undefined;
  previousRange: DateRange | undefined;
  className?: string;
}

interface ComparisonStat {
  label: string;
  current: number;
  previous: number;
  formatter: (value: number) => string;
  isHigherBetter?: boolean;
}

export function ComparisonView({
  currentMetrics,
  previousMetrics,
  currentRange,
  previousRange,
  className,
}: ComparisonViewProps) {
  const calculateTotals = (metrics: TestMetrics[]) => {
    return metrics.reduce(
      (acc, metric) => ({
        totalRuns: acc.totalRuns + metric.totalRuns,
        totalCost: acc.totalCost + (metric.averageCost * metric.totalRuns),
        totalDuration: acc.totalDuration + (metric.averageDuration * metric.totalRuns),
        successfulRuns: acc.successfulRuns + metric.successfulRuns,
        failedRuns: acc.failedRuns + metric.failedRuns,
      }),
      { totalRuns: 0, totalCost: 0, totalDuration: 0, successfulRuns: 0, failedRuns: 0 }
    );
  };

  const currentTotals = calculateTotals(currentMetrics);
  const previousTotals = calculateTotals(previousMetrics);

  const currentAvgCost = currentTotals.totalRuns > 0 ? currentTotals.totalCost / currentTotals.totalRuns : 0;
  const previousAvgCost = previousTotals.totalRuns > 0 ? previousTotals.totalCost / previousTotals.totalRuns : 0;
  
  const currentAvgDuration = currentTotals.totalRuns > 0 ? currentTotals.totalDuration / currentTotals.totalRuns : 0;
  const previousAvgDuration = previousTotals.totalRuns > 0 ? previousTotals.totalDuration / previousTotals.totalRuns : 0;

  const currentSuccessRate = currentTotals.totalRuns > 0 ? currentTotals.successfulRuns / currentTotals.totalRuns : 0;
  const previousSuccessRate = previousTotals.totalRuns > 0 ? previousTotals.successfulRuns / previousTotals.totalRuns : 0;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatPercent = (rate: number) => `${(rate * 100).toFixed(1)}%`;
  const formatNumber = (num: number) => num.toString();

  const stats: ComparisonStat[] = [
    {
      label: "Total Runs",
      current: currentTotals.totalRuns,
      previous: previousTotals.totalRuns,
      formatter: formatNumber,
      isHigherBetter: true,
    },
    {
      label: "Average Cost",
      current: currentAvgCost,
      previous: previousAvgCost,
      formatter: formatCurrency,
      isHigherBetter: false,
    },
    {
      label: "Average Duration",
      current: currentAvgDuration,
      previous: previousAvgDuration,
      formatter: formatDuration,
      isHigherBetter: false,
    },
    {
      label: "Success Rate",
      current: currentSuccessRate,
      previous: previousSuccessRate,
      formatter: formatPercent,
      isHigherBetter: true,
    },
  ];

  const getChangeIcon = (current: number, previous: number, isHigherBetter = true) => {
    if (previous === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    const isIncreasing = current > previous;
    const isPositiveChange = isHigherBetter ? isIncreasing : !isIncreasing;
    
    if (isIncreasing) {
      return <TrendingUp className={cn("h-4 w-4", isPositiveChange ? "text-success" : "text-destructive")} />;
    } else {
      return <TrendingDown className={cn("h-4 w-4", isPositiveChange ? "text-success" : "text-destructive")} />;
    }
  };

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return "N/A";
    return `${(((current - previous) / previous) * 100).toFixed(1)}%`;
  };

  const getChangeColor = (current: number, previous: number, isHigherBetter = true) => {
    if (previous === 0) return "text-muted-foreground";
    
    const isIncreasing = current > previous;
    const isPositiveChange = isHigherBetter ? isIncreasing : !isIncreasing;
    
    return isPositiveChange ? "text-success" : "text-destructive";
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "No range selected";
    if (!range.to) return format(range.from, "MMM dd, yyyy");
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Period Comparison</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Current: {formatDateRange(currentRange)}</div>
          <div>Previous: {formatDateRange(previousRange)}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
              <div className="text-2xl font-bold">
                {stat.formatter(stat.current)}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                {getChangeIcon(stat.current, stat.previous, stat.isHigherBetter)}
                <span className={getChangeColor(stat.current, stat.previous, stat.isHigherBetter)}>
                  {getChangePercent(stat.current, stat.previous)}
                </span>
                <span className="text-muted-foreground">vs previous</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Previous: {stat.formatter(stat.previous)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}