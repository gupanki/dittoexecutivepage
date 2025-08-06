export interface TestExecution {
  id: string;
  testName: string;
  startTime: Date;
  duration: number; // in milliseconds
  successRate: number; // 0-1
  cost: number; // in dollars
  validation: boolean;
}

export interface TestMetrics {
  testName: string;
  averageDuration: number;
  averageCost: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
}

export interface TimelineData {
  date: string;
  runs: number;
  averageCost: number;
  successRate: number;
}

// Generate mock test execution data
const testNames = [
  "send-message-test",
  "add-reaction-test", 
  "user-authentication-test",
  "file-upload-test",
  "payment-processing-test",
  "notification-delivery-test",
  "database-connection-test",
  "api-endpoint-test",
  "search-functionality-test",
  "user-registration-test"
];

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTestExecution(id: string, testName: string, date: Date): TestExecution {
  const baseSuccessRate = 0.7 + Math.random() * 0.25; // 70-95% success rate
  const baseDuration = 1000 + Math.random() * 5000; // 1-6 seconds
  const baseCost = 0.01 + Math.random() * 0.5; // $0.01-$0.51
  
  return {
    id,
    testName,
    startTime: date,
    duration: Math.round(baseDuration + (Math.random() - 0.5) * 1000),
    successRate: Math.min(1, Math.max(0, baseSuccessRate + (Math.random() - 0.5) * 0.3)),
    cost: Number((baseCost + (Math.random() - 0.5) * 0.1).toFixed(4)),
    validation: Math.random() > 0.1 // 90% validation success
  };
}

// Generate test data for the last 60 days
export function generateMockData(): TestExecution[] {
  const data: TestExecution[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 60);
  
  let idCounter = 1;
  
  // Generate data for each day
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const runsPerDay = Math.floor(Math.random() * 20) + 5; // 5-25 runs per day
    
    for (let i = 0; i < runsPerDay; i++) {
      const randomTestName = testNames[Math.floor(Math.random() * testNames.length)];
      const randomTime = generateRandomDate(
        new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
      );
      
      data.push(generateTestExecution(
        `test-${idCounter.toString().padStart(4, '0')}`,
        randomTestName,
        randomTime
      ));
      
      idCounter++;
    }
  }
  
  return data.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export function calculateTestMetrics(data: TestExecution[]): TestMetrics[] {
  const testGroups = data.reduce((acc, test) => {
    if (!acc[test.testName]) {
      acc[test.testName] = [];
    }
    acc[test.testName].push(test);
    return acc;
  }, {} as Record<string, TestExecution[]>);

  return Object.entries(testGroups).map(([testName, tests]) => {
    const totalRuns = tests.length;
    const successfulRuns = tests.filter(t => t.successRate > 0.5).length;
    const failedRuns = totalRuns - successfulRuns;
    const averageDuration = tests.reduce((sum, t) => sum + t.duration, 0) / totalRuns;
    const averageCost = tests.reduce((sum, t) => sum + t.cost, 0) / totalRuns;
    const successRate = successfulRuns / totalRuns;

    return {
      testName,
      averageDuration,
      averageCost,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate
    };
  });
}

export function generateTimelineData(data: TestExecution[]): TimelineData[] {
  const dailyGroups = data.reduce((acc, test) => {
    const dateKey = test.startTime.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(test);
    return acc;
  }, {} as Record<string, TestExecution[]>);

  return Object.entries(dailyGroups).map(([date, tests]) => {
    const runs = tests.length;
    const averageCost = tests.reduce((sum, t) => sum + t.cost, 0) / runs;
    const successfulTests = tests.filter(t => t.successRate > 0.5).length;
    const successRate = successfulTests / runs;

    return {
      date,
      runs,
      averageCost,
      successRate
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function filterDataByDateRange(
  data: TestExecution[], 
  startDate: Date, 
  endDate: Date
): TestExecution[] {
  return data.filter(test => 
    test.startTime >= startDate && test.startTime <= endDate
  );
}

export function filterDataByTestNames(
  data: TestExecution[], 
  testNames: string[]
): TestExecution[] {
  if (testNames.length === 0) return data;
  return data.filter(test => testNames.includes(test.testName));
}