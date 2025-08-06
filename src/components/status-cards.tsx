import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { TestMetrics } from "@/lib/test-data";

interface StatusCardsProps {
  metrics: TestMetrics[];
  totalRuns: number;
  overallSuccessRate: number;
}

export function StatusCards({ metrics, totalRuns, overallSuccessRate }: StatusCardsProps) {
  // Calculate status categories
  const workingWell = metrics.filter(m => m.successRate >= 0.95);
  const needsAttention = metrics.filter(m => m.successRate >= 0.8 && m.successRate < 0.95);
  const atRisk = metrics.filter(m => m.successRate < 0.8);

  const workingWellRuns = workingWell.reduce((sum, m) => sum + m.totalRuns, 0);
  const attentionRuns = needsAttention.reduce((sum, m) => sum + m.totalRuns, 0);
  const riskRuns = atRisk.reduce((sum, m) => sum + m.totalRuns, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-success/20 bg-success/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <CardTitle className="text-sm font-medium text-success">Working Well</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-success">
              {workingWell.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tests with ≥95% success rate
            </p>
            <div className="flex gap-1 flex-wrap">
              {workingWell.slice(0, 3).map((test) => (
                <Badge key={test.testName} variant="secondary" className="text-xs">
                  {test.testName}
                </Badge>
              ))}
              {workingWell.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workingWell.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning/20 bg-warning/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-sm font-medium text-warning">Needs Attention</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-warning">
              {needsAttention.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tests with 80-94% success rate
            </p>
            <div className="flex gap-1 flex-wrap">
              {needsAttention.slice(0, 3).map((test) => (
                <Badge key={test.testName} variant="secondary" className="text-xs">
                  {test.testName}
                </Badge>
              ))}
              {needsAttention.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{needsAttention.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-sm font-medium text-destructive">At Risk</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-destructive">
              {atRisk.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tests with &lt;80% success rate
            </p>
            <div className="flex gap-1 flex-wrap">
              {atRisk.slice(0, 3).map((test) => (
                <Badge key={test.testName} variant="secondary" className="text-xs">
                  {test.testName}
                </Badge>
              ))}
              {atRisk.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{atRisk.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}