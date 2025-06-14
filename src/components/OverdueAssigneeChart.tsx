
import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Task } from '@/types/task';

interface OverdueAssigneeChartProps {
  tasks: Task[];
}

const chartConfig = {
  overdue: {
    label: 'Overdue Tasks',
    color: 'hsl(var(--destructive))',
  },
};

const OverdueAssigneeChart: React.FC<OverdueAssigneeChartProps> = ({ tasks }) => {
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return task.status !== 'closed' && dueDate < today;
    });

    const tasksByAssignee = overdueTasks.reduce((acc, task) => {
      const assignee = task.assignee || 'Unassigned';
      if (!acc[assignee]) {
        acc[assignee] = 0;
      }
      acc[assignee]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tasksByAssignee).map(([assignee, count]) => ({
      assignee,
      overdue: count,
    })).sort((a, b) => b.overdue - a.overdue);
  }, [tasks]);

  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle>Overdue Tasks by Assignee</CardTitle>
        <CardDescription>Number of active tasks past their due date.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="assignee"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltipContent />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="overdue" fill="var(--color-overdue)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No overdue tasks found. Great job!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverdueAssigneeChart;
