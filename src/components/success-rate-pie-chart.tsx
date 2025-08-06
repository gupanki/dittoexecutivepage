import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuccessRatePieChartProps {
  totalSuccessful: number;
  totalFailed: number;
  className?: string;
}

export function SuccessRatePieChart({ totalSuccessful, totalFailed, className }: SuccessRatePieChartProps) {
  const data = [
    { name: "Successful", value: totalSuccessful, color: "hsl(var(--success))" },
    { name: "Failed", value: totalFailed, color: "hsl(var(--destructive))" }
  ];

  const total = totalSuccessful + totalFailed;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-popover border border-border rounded-md p-2 shadow-md">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} tests ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Success/Failure Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}