import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTestData } from '@/hooks/useTestData';
import { Upload, Plus, FileText, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function TestDataUploader() {
  const { addTestExecution } = useTestData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate required headers
      const requiredHeaders = ['testname', 'starttime', 'duration', 'successrate', 'cost'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      let successCount = 0;
      let errorCount = 0;

      // Process each data row
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length !== headers.length) {
            console.warn(`Row ${i + 1}: Column count mismatch, skipping`);
            errorCount++;
            continue;
          }

          const rowData: { [key: string]: string } = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });

          // Parse and validate data
          const testExecution = {
            testName: rowData.testname,
            startTime: new Date(rowData.starttime),
            duration: parseFloat(rowData.duration) * 1000, // Convert to milliseconds
            successRate: parseFloat(rowData.successrate) / 100, // Convert to 0-1 range
            cost: parseFloat(rowData.cost),
            validation: true
          };

          // Validate parsed data
          if (isNaN(testExecution.startTime.getTime())) {
            throw new Error(`Invalid date format in row ${i + 1}`);
          }
          if (isNaN(testExecution.duration) || testExecution.duration < 0) {
            throw new Error(`Invalid duration in row ${i + 1}`);
          }
          if (isNaN(testExecution.successRate) || testExecution.successRate < 0 || testExecution.successRate > 1) {
            throw new Error(`Invalid success rate in row ${i + 1} (must be 0-100)`);
          }
          if (isNaN(testExecution.cost) || testExecution.cost < 0) {
            throw new Error(`Invalid cost in row ${i + 1}`);
          }

          await addTestExecution(testExecution);
          successCount++;
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload completed",
        description: `Successfully imported ${successCount} test executions. ${errorCount > 0 ? `${errorCount} rows had errors.` : ''}`,
      });

    } catch (error) {
      console.error('Error processing CSV file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `testname,starttime,duration,successrate,cost
user-authentication-test,2024-01-15,2.5,95.5,0.0250
payment-processing-test,2024-01-15,4.2,88.0,0.0420
api-endpoint-test,2024-01-15,1.8,99.2,0.0180`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-data-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Test Execution Data
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add test execution records manually or upload from CSV files
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">CSV Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file with test execution data. Make sure it includes the required columns.
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Choose CSV File'}
                    </Button>
                    
                    <Button 
                      onClick={downloadTemplate}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">CSV Format Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>testname</strong>: Name of the test (e.g., "user-authentication-test")</li>
                    <li>• <strong>starttime</strong>: Date/time when test was run (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)</li>
                    <li>• <strong>duration</strong>: Test duration in seconds (e.g., 3.5)</li>
                    <li>• <strong>successrate</strong>: Success rate percentage 0-100 (e.g., 95.5)</li>
                    <li>• <strong>cost</strong>: Test cost in USD (e.g., 0.0250)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}