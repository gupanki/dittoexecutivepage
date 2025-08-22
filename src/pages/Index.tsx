import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Activity, Database } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary-glow/10 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Ditto Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Executive-level insights into test automation performance, cost analysis, and success metrics
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-gradient text-primary-foreground border-0 transition-smooth hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-primary-foreground/90">
                Track test execution success rates, duration, and cost trends with beautiful visualizations
              </p>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-gradient-to-br from-success/10 to-success/5 transition-smooth hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-success">
                <TrendingUp className="h-8 w-8" />
                Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compare performance across time periods and identify improvement opportunities
              </p>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-gradient-to-br from-warning/10 to-warning/5 transition-smooth hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-warning">
                <Activity className="h-8 w-8" />
                Real-time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor test health categorization and get instant alerts for at-risk tests
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary-glow/5 transition-smooth hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-primary">
                <Database className="h-8 w-8" />
                Data Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect your test execution data and get actionable insights instantly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">
                Launch your executive dashboard and start monitoring your test automation performance
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size="lg"
                  className="card-gradient border-0 hover:shadow-lg transition-smooth"
                >
                  View Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary/10 transition-smooth"
                >
                  Add Test Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">2.3s</div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning">$0.025</div>
            <div className="text-sm text-muted-foreground">Cost per Test</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
