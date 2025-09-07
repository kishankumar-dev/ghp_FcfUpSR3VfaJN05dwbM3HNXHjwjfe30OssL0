'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAIInsights } from '@/ai/flows/generate-ai-insights';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AiInsights({
  performanceData,
  usageData,
}: {
  performanceData: any;
  usageData: any;
}) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateInsight = async () => {
    setIsLoading(true);
    setInsight('');
    try {
      const result = await generateAIInsights({
        performanceTrends: JSON.stringify(performanceData),
        usageStatistics: JSON.stringify(usageData),
      });
      setInsight(result.insights);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate insights. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
        <Button onClick={handleGenerateInsight} disabled={isLoading} size="sm">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground min-h-[40px] flex items-center">
          {isLoading && <p>Generating analysis, please wait...</p>}
          {insight ? (
            <p className="text-foreground">{insight}</p>
          ) : (
            !isLoading && (
              <p>
                Click 'Generate' to get AI-powered insights on your performance and usage data.
              </p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
