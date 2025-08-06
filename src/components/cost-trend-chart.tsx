import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineData } from "@/lib/test-data";
import { format } from "date-fns";

interface CostTrendChartProps {
  data: TimelineData[];
  className?: string;
}

export function CostTrendChart({ data, className }: CostTrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-md p-3 shadow-md">
          <p className="text-sm font-medium mb-2">
            {format(new Date(label), "MMM dd, yyyy")}
          </p>
          <p className="text-sm text-primary">
            Average Cost: ${payload[0].value.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Cost Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), "MMM dd")}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `$${value.toFixed(3)}`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="averageCost" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}