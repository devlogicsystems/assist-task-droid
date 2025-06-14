
import React, { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Task } from '@/types/task';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface OverdueTrendChartProps {
  tasks: Task[];
}

const chartConfig = {
  overdue: {
    label: 'Overdue Tasks',
    color: 'hsl(var(--destructive))',
  },
};

const OverdueTrendChart: React.FC<OverdueTrendChartProps> = ({ tasks }) => {
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const interval = {
        start: subDays(today, 29), // 30 day trend
        end: today
    };
    const dateRange = eachDayOfInterval(interval);

    return dateRange.map(date => {
        const count = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0,0,0,0);
            return task.status !== 'closed' && dueDate < date;
        }).length;

        return {
            date: format(date, 'MMM d'),
            overdue: count
        };
    });
  }, [tasks]);

  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle>Overdue Tasks Trend</CardTitle>
        <CardDescription>Cumulative overdue tasks over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <LineChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value, index) => {
                  if (chartData.length > 7 && index % 5 !== 0 && index !== chartData.length - 1) return "";
                  return value;
              }}
            />
            <YAxis allowDecimals={false}/>
            <ChartTooltipContent />
            <Line
              type="monotone"
              dataKey="overdue"
              stroke="var(--color-overdue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OverdueTrendChart;
