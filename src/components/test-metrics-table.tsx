import * as React from "react";
import { ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react";

import { TestMetrics } from "@/lib/test-data";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TestMetricsTableProps {
  metrics: TestMetrics[];
  comparisonMetrics?: TestMetrics[];
  className?: string;
}

type SortField = keyof TestMetrics;
type SortDirection = "asc" | "desc";

interface ComparisonData {
  costChange: number;
  durationChange: number;
}

export function TestMetricsTable({
  metrics,
  comparisonMetrics,
  className,
}: TestMetricsTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("testName");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getComparison = (testName: string): ComparisonData | null => {
    if (!comparisonMetrics) return null;
    
    const current = metrics.find(m => m.testName === testName);
    const previous = comparisonMetrics.find(m => m.testName === testName);
    
    if (!current || !previous) return null;
    
    const costChange = ((current.averageCost - previous.averageCost) / previous.averageCost) * 100;
    const durationChange = ((current.averageDuration - previous.averageDuration) / previous.averageDuration) * 100;
    
    return { costChange, durationChange };
  };

  const sortedMetrics = React.useMemo(() => {
    return [...metrics].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [metrics, sortField, sortDirection]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(4)}`;
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 0.9) return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    if (rate >= 0.7) return <Badge variant="secondary">Good</Badge>;
    if (rate >= 0.5) return <Badge className="bg-warning text-warning-foreground">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const ChangeIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) return null;
    
    return (
      <div className={cn(
        "flex items-center text-xs ml-1",
        value > 0 ? "text-destructive" : "text-success"
      )}>
        {value > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(value).toFixed(1)}%
      </div>
    );
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("testName")}
                className="h-auto p-0 font-medium"
              >
                Test Name (ID)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("averageDuration")}
                className="h-auto p-0 font-medium"
              >
                Avg Duration
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("averageCost")}
                className="h-auto p-0 font-medium"
              >
                Avg Cost
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("totalRuns")}
                className="h-auto p-0 font-medium"
              >
                Total Runs
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("successfulRuns")}
                className="h-auto p-0 font-medium"
              >
                Successful
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("failedRuns")}
                className="h-auto p-0 font-medium"
              >
                Failed
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("successRate")}
                className="h-auto p-0 font-medium"
              >
                Success Rate
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMetrics.map((metric) => {
            const comparison = getComparison(metric.testName);
            
            return (
              <TableRow key={metric.testName}>
                <TableCell className="font-medium">
                  {metric.testName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {formatDuration(metric.averageDuration)}
                    {comparison && <ChangeIndicator value={comparison.durationChange} />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {formatCurrency(metric.averageCost)}
                    {comparison && <ChangeIndicator value={comparison.costChange} />}
                  </div>
                </TableCell>
                <TableCell>{metric.totalRuns}</TableCell>
                <TableCell className="text-success">{metric.successfulRuns}</TableCell>
                <TableCell className="text-destructive">{metric.failedRuns}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{(metric.successRate * 100).toFixed(1)}%</span>
                    {getSuccessRateBadge(metric.successRate)}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}