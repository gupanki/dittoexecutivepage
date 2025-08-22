import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TestExecution, TestMetrics, TimelineData } from '@/lib/test-data';

export function useTestData() {
  const [data, setData] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const { data: testData, error } = await supabase
        .from('test_executions')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform Supabase data to match TestExecution interface
      const transformedData: TestExecution[] = (testData || []).map(test => ({
        id: test.id,
        testName: test.test_name,
        startTime: new Date(test.start_time),
        duration: test.duration,
        successRate: test.success_rate,
        cost: test.cost,
        validation: test.validation
      }));

      setData(transformedData);
    } catch (err) {
      console.error('Error fetching test data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch test data');
    } finally {
      setLoading(false);
    }
  };

  const addTestExecution = async (testExecution: Omit<TestExecution, 'id'>) => {
    try {
      const { data: newTest, error } = await supabase
        .from('test_executions')
        .insert({
          test_name: testExecution.testName,
          start_time: testExecution.startTime.toISOString(),
          duration: testExecution.duration,
          success_rate: testExecution.successRate,
          cost: testExecution.cost,
          validation: testExecution.validation,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const transformedTest: TestExecution = {
        id: newTest.id,
        testName: newTest.test_name,
        startTime: new Date(newTest.start_time),
        duration: newTest.duration,
        successRate: newTest.success_rate,
        cost: newTest.cost,
        validation: newTest.validation
      };

      setData(prev => [...prev, transformedTest]);
      return transformedTest;
    } catch (err) {
      console.error('Error adding test execution:', err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addTestExecution,
    refetch: fetchTestData
  };
}