import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

import { TimelineData } from "@/lib/test-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineChartProps {
  data: TimelineData[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">
          {format(parseISO(label as string), "MMM dd, yyyy")}
        </p>
        <div className="space-y-1 text-sm">
          <p className="flex justify-between gap-4">
            <span className="text-muted-foreground">Total Runs:</span>
            <span className="font-medium">{data.runs}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-muted-foreground">Avg Cost:</span>
            <span className="font-medium">${data.averageCost.toFixed(4)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-muted-foreground">Success Rate:</span>
            <span className="font-medium">{(data.successRate * 100).toFixed(1)}%</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export function TimelineChart({ data, className }: TimelineChartProps) {
  const maxRuns = Math.max(...data.map(d => d.runs));
  
  // Add color based on activity level
  const chartData = data.map(item => ({
    ...item,
    activityLevel: item.runs / maxRuns
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Test Activity Timeline</CardTitle>
        <CardDescription>
          Daily test execution volume with success rates and costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => format(parseISO(value), "MMM dd")}
              stroke="hsl(var(--foreground))"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--foreground))"
              label={{ value: 'Number of Runs', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="runs" 
              radius={[2, 2, 0, 0]}
              fill="hsl(var(--primary))"
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Test Runs</span>
            </div>
          </div>
          <span>Hover over bars for detailed metrics</span>
        </div>
      </CardContent>
    </Card>
  );
}