import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

import { TestMetrics } from "@/lib/test-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExecutiveChartsProps {
  metrics: TestMetrics[];
  className?: string;
}

export function ExecutiveCharts({ metrics, className }: ExecutiveChartsProps) {
  // Team Performance Data (grouped by test prefix)
  const teamPerformance = React.useMemo(() => {
    const teams = metrics.reduce((acc, metric) => {
      const team = metric.testName.split('-')[0] || 'Other';
      if (!acc[team]) {
        acc[team] = { name: team, runs: 0, successRate: 0, cost: 0, tests: 0 };
      }
      acc[team].runs += metric.totalRuns;
      acc[team].successRate += metric.successRate;
      acc[team].cost += metric.averageCost * metric.totalRuns;
      acc[team].tests += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(teams).map((team: any) => ({
      ...team,
      successRate: (team.successRate / team.tests) * 100,
      avgCost: team.cost / team.runs,
      efficiency: ((team.successRate / team.tests) * 100) / (team.cost / team.runs * 1000), // Success per dollar
    }));
  }, [metrics]);

  // Quality Distribution
  const qualityDistribution = React.useMemo(() => {
    const excellent = metrics.filter(m => m.successRate >= 0.95).length;
    const good = metrics.filter(m => m.successRate >= 0.85 && m.successRate < 0.95).length;
    const fair = metrics.filter(m => m.successRate >= 0.70 && m.successRate < 0.85).length;
    const poor = metrics.filter(m => m.successRate < 0.70).length;

    return [
      { name: "Excellent (95%+)", value: excellent, color: "hsl(var(--success))" },
      { name: "Good (85-94%)", value: good, color: "hsl(var(--info))" },
      { name: "Fair (70-84%)", value: fair, color: "hsl(var(--warning))" },
      { name: "Needs Attention (<70%)", value: poor, color: "hsl(var(--destructive))" },
    ].filter(item => item.value > 0);
  }, [metrics]);

  // Cost vs Quality Analysis
  const costQualityData = React.useMemo(() => {
    return metrics.map(metric => ({
      name: metric.testName.split('-')[0],
      cost: metric.averageCost * 1000, // Convert to readable scale
      quality: metric.successRate * 100,
      size: metric.totalRuns,
    }));
  }, [metrics]);

  const getTeamColor = (index: number) => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--success))", 
      "hsl(var(--info))",
      "hsl(var(--warning))",
      "hsl(var(--chart-5))"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Efficiency Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Success rate and cost efficiency by team/area
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--foreground))"
                  label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <Bar dataKey="successRate" radius={[4, 4, 0, 0]}>
                  {teamPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTeamColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {teamPerformance.map((team, index) => (
                <div key={team.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: getTeamColor(index) }}
                    />
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>{team.runs} runs</span>
                    <span>${(team.avgCost).toFixed(3)} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Test scenarios by quality level
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {qualityDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant="secondary">{item.value} tests</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <h4 className="font-semibold text-success mb-2">✓ Performing Well</h4>
              <p className="text-sm text-muted-foreground">
                {qualityDistribution.find(q => q.name.includes("Excellent"))?.value || 0} tests 
                achieving excellent quality scores
              </p>
            </div>
            
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <h4 className="font-semibold text-warning mb-2">⚠ Needs Attention</h4>
              <p className="text-sm text-muted-foreground">
                {qualityDistribution.find(q => q.name.includes("Attention"))?.value || 0} tests 
                require quality improvement focus
              </p>
            </div>
            
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <h4 className="font-semibold text-info mb-2">📊 Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Consider cost optimization for high-volume, 
                lower-efficiency test scenarios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}