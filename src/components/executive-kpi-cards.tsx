import * as React from "react";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react";

import { TestMetrics } from "@/lib/test-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExecutiveKPICardsProps {
  metrics: TestMetrics[];
  previousMetrics: TestMetrics[];
  className?: string;
}

interface KPIData {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  status: "excellent" | "good" | "attention" | "critical";
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
}

export function ExecutiveKPICards({ 
  metrics, 
  previousMetrics, 
  className 
}: ExecutiveKPICardsProps) {
  const calculateKPIs = React.useMemo(() => {
    const current = metrics.reduce(
      (acc, m) => ({
        totalRuns: acc.totalRuns + m.totalRuns,
        totalCost: acc.totalCost + (m.averageCost * m.totalRuns),
        successfulRuns: acc.successfulRuns + m.successfulRuns,
        totalDuration: acc.totalDuration + (m.averageDuration * m.totalRuns),
      }),
      { totalRuns: 0, totalCost: 0, successfulRuns: 0, totalDuration: 0 }
    );

    const previous = previousMetrics.reduce(
      (acc, m) => ({
        totalRuns: acc.totalRuns + m.totalRuns,
        totalCost: acc.totalCost + (m.averageCost * m.totalRuns),
        successfulRuns: acc.successfulRuns + m.successfulRuns,
        totalDuration: acc.totalDuration + (m.averageDuration * m.totalRuns),
      }),
      { totalRuns: 0, totalCost: 0, successfulRuns: 0, totalDuration: 0 }
    );

    const qualityScore = current.totalRuns > 0 ? (current.successfulRuns / current.totalRuns) * 100 : 0;
    const previousQualityScore = previous.totalRuns > 0 ? (previous.successfulRuns / previous.totalRuns) * 100 : 0;
    const qualityChange = previousQualityScore > 0 ? qualityScore - previousQualityScore : 0;

    const avgCost = current.totalRuns > 0 ? current.totalCost / current.totalRuns : 0;
    const prevAvgCost = previous.totalRuns > 0 ? previous.totalCost / previous.totalRuns : 0;
    const costEfficiency = prevAvgCost > 0 ? ((prevAvgCost - avgCost) / prevAvgCost) * 100 : 0;

    const avgDuration = current.totalRuns > 0 ? current.totalDuration / current.totalRuns : 0;
    const prevAvgDuration = previous.totalRuns > 0 ? previous.totalDuration / previous.totalRuns : 0;
    const performanceChange = prevAvgDuration > 0 ? ((prevAvgDuration - avgDuration) / prevAvgDuration) * 100 : 0;

    const testCoverage = metrics.length; // Number of different tests
    const prevTestCoverage = previousMetrics.length;
    const coverageChange = prevTestCoverage > 0 ? ((testCoverage - prevTestCoverage) / prevTestCoverage) * 100 : 0;

    return {
      qualityScore,
      qualityChange,
      costEfficiency,
      performanceChange,
      coverageChange,
      totalCost: current.totalCost,
      avgDuration,
      testCoverage,
    };
  }, [metrics, previousMetrics]);

  const getStatus = (value: number, thresholds: { excellent: number; good: number; attention: number }) => {
    if (value >= thresholds.excellent) return "excellent";
    if (value >= thresholds.good) return "good";
    if (value >= thresholds.attention) return "attention";
    return "critical";
  };

  const getTrend = (change: number): "up" | "down" | "stable" => {
    if (Math.abs(change) < 1) return "stable";
    return change > 0 ? "up" : "down";
  };

  const kpis: KPIData[] = [
    {
      title: "Quality Score",
      value: `${calculateKPIs.qualityScore.toFixed(1)}%`,
      change: calculateKPIs.qualityChange,
      trend: getTrend(calculateKPIs.qualityChange),
      status: getStatus(calculateKPIs.qualityScore, { excellent: 95, good: 85, attention: 70 }),
      icon: CheckCircle,
      subtitle: "Overall test success rate",
    },
    {
      title: "Cost Efficiency",
      value: calculateKPIs.costEfficiency >= 0 ? `+${calculateKPIs.costEfficiency.toFixed(1)}%` : `${calculateKPIs.costEfficiency.toFixed(1)}%`,
      change: calculateKPIs.costEfficiency,
      trend: getTrend(calculateKPIs.costEfficiency),
      status: getStatus(Math.abs(calculateKPIs.costEfficiency), { excellent: 15, good: 10, attention: 5 }),
      icon: DollarSign,
      subtitle: "Cost savings vs previous period",
    },
    {
      title: "Performance",
      value: calculateKPIs.avgDuration < 1000 ? `${Math.round(calculateKPIs.avgDuration)}ms` : `${(calculateKPIs.avgDuration / 1000).toFixed(1)}s`,
      change: calculateKPIs.performanceChange,
      trend: getTrend(calculateKPIs.performanceChange),
      status: getStatus(-calculateKPIs.performanceChange, { excellent: 10, good: 5, attention: 0 }),
      icon: Clock,
      subtitle: "Average test execution time",
    },
    {
      title: "Test Coverage",
      value: `${calculateKPIs.testCoverage} Tests`,
      change: calculateKPIs.coverageChange,
      trend: getTrend(calculateKPIs.coverageChange),
      status: getStatus(calculateKPIs.testCoverage, { excellent: 8, good: 6, attention: 4 }),
      icon: AlertTriangle,
      subtitle: "Active test scenarios",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success";
      case "good": return "text-info";
      case "attention": return "text-warning";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent": return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
      case "good": return <Badge className="bg-info text-info-foreground">Good</Badge>;
      case "attention": return <Badge className="bg-warning text-warning-foreground">Attention</Badge>;
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "stable") return null;
    
    const iconClass = "h-4 w-4 ml-1";
    if (trend === "up") {
      return <TrendingUp className={cn(iconClass, change > 0 ? "text-success" : "text-destructive")} />;
    }
    return <TrendingDown className={cn(iconClass, change < 0 ? "text-success" : "text-destructive")} />;
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              <span>{kpi.title}</span>
              <kpi.icon className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={cn("text-2xl font-bold", getStatusColor(kpi.status))}>
                {kpi.value}
              </span>
              {getStatusBadge(kpi.status)}
            </div>
            
            <div className="flex items-center text-sm">
              <span className={cn(
                "font-medium",
                Math.abs(kpi.change) < 1 ? "text-muted-foreground" : 
                kpi.change > 0 ? "text-success" : "text-destructive"
              )}>
                {Math.abs(kpi.change) < 1 ? "No change" : 
                 `${kpi.change > 0 ? "+" : ""}${kpi.change.toFixed(1)}%`}
              </span>
              {getTrendIcon(kpi.trend, kpi.change)}
            </div>
            
            <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}