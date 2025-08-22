-- Create test_executions table for storing test automation data
CREATE TABLE public.test_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in milliseconds
  success_rate DECIMAL(3,2) NOT NULL CHECK (success_rate >= 0 AND success_rate <= 1),
  cost DECIMAL(10,4) NOT NULL DEFAULT 0, -- in dollars
  validation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for test_executions
CREATE POLICY "Users can view their own test executions" 
ON public.test_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test executions" 
ON public.test_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test executions" 
ON public.test_executions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test executions" 
ON public.test_executions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_test_executions_user_id ON public.test_executions(user_id);
CREATE INDEX idx_test_executions_test_name ON public.test_executions(test_name);
CREATE INDEX idx_test_executions_start_time ON public.test_executions(start_time);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_test_executions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_test_executions_updated_at
  BEFORE UPDATE ON public.test_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_test_executions_updated_at();