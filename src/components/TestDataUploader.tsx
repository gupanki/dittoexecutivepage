import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTestData } from '@/hooks/useTestData';
import { Upload, Plus } from 'lucide-react';

export function TestDataUploader() {
  const { addTestExecution } = useTestData();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    testName: '',
    duration: '',
    successRate: '',
    cost: '',
    startTime: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsAdding(true);
      await addTestExecution({
        testName: formData.testName,
        startTime: new Date(formData.startTime),
        duration: parseInt(formData.duration) * 1000, // Convert to milliseconds
        successRate: parseFloat(formData.successRate) / 100, // Convert to 0-1 range
        cost: parseFloat(formData.cost),
        validation: true
      });

      toast({
        title: "Test execution added",
        description: `Successfully added ${formData.testName} test execution.`,
      });

      // Reset form
      setFormData({
        testName: '',
        duration: '',
        successRate: '',
        cost: '',
        startTime: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding test execution:', error);
      toast({
        title: "Error",
        description: "Failed to add test execution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Add Test Execution Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add individual test execution records to populate your dashboard
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                placeholder="e.g., user-authentication-test"
                value={formData.testName}
                onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">Execution Date</Label>
              <Input
                id="startTime"
                type="date"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 3.5"
                step="0.1"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="successRate">Success Rate (%)</Label>
              <Input
                id="successRate"
                type="number"
                placeholder="e.g., 95.5"
                step="0.1"
                min="0"
                max="100"
                value={formData.successRate}
                onChange={(e) => setFormData(prev => ({ ...prev, successRate: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cost">Cost (USD)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="e.g., 0.0250"
                step="0.0001"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isAdding}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 transition-smooth"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Adding...' : 'Add Test Execution'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}