import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { UsageChart } from '@/components/dashboard/usage-chart';
import { ModelRunsTable } from '@/components/dashboard/model-runs-table';
import {
  Bot,
  Cpu,
  Gauge,
  Activity,
} from 'lucide-react';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { performanceData, usageData } from '@/lib/mock-data';

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Active Models"
              value="12"
              change="+5.2%"
              icon={<Bot className="h-4 w-4 text-muted-foreground" />}
              description="Compared to last month"
            />
            <KpiCard
              title="API Requests"
              value="1.2M"
              change="+15.1%"
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              description="Compared to last month"
            />
            <KpiCard
              title="Accuracy"
              value="97.3%"
              change="+1.8%"
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              description="Average model accuracy"
            />
            <KpiCard
              title="Response Time"
              value="120ms"
              change="-2.3%"
              icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
              description="Average API response time"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>AI Performance Trends</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <PerformanceChart data={performanceData} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Breakdown of AI usage by category.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageChart data={usageData} />
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <AiInsights performanceData={performanceData} usageData={usageData} />
          </div>

          <ModelRunsTable />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
