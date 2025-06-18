
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TaskCard from '@/components/TaskCard';

interface OverdueAssigneeListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}

const OverdueAssigneeList: React.FC<OverdueAssigneeListProps> = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskEdit 
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedAssigneeTasks, setSelectedAssigneeTasks] = useState<Task[]>([]);

  const overdueData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return task.status !== 'closed' && dueDate < today;
    });

    const tasksByAssignee = overdueTasks.reduce((acc, task) => {
      const assignee = task.assignee || 'Unassigned';
      if (!acc[assignee]) {
        acc[assignee] = [];
      }
      acc[assignee].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return Object.entries(tasksByAssignee)
      .map(([assignee, assigneeTasks]) => ({
        assignee,
        count: assigneeTasks.length,
        tasks: assigneeTasks,
      }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  const handleAssigneeClick = (assignee: string, assigneeTasks: Task[]) => {
    setSelectedAssignee(assignee);
    setSelectedAssigneeTasks(assigneeTasks);
  };

  return (
    <>
      <Card className="glass-effect h-full">
        <CardHeader>
          <CardTitle>Overdue Tasks by Assignee</CardTitle>
          <CardDescription>Active tasks past their due date grouped by assignee.</CardDescription>
        </CardHeader>
        <CardContent>
          {overdueData.length > 0 ? (
            <div className="space-y-2">
              {overdueData.map(({ assignee, count, tasks: assigneeTasks }) => (
                <Button
                  key={assignee}
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => handleAssigneeClick(assignee, assigneeTasks)}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{assignee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{count}</Badge>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No overdue tasks found. Great job!
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAssignee} onOpenChange={() => setSelectedAssignee(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Overdue Tasks - {selectedAssignee}</DialogTitle>
            <DialogDescription>
              {selectedAssigneeTasks.length} overdue task(s) assigned to {selectedAssignee}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {selectedAssigneeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onTaskUpdate}
                onEdit={onTaskEdit}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OverdueAssigneeList;
