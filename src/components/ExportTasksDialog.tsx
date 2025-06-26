
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Task } from '@/types/task';
import { ExportOptions } from '@/hooks/useTaskIO';

interface ExportTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  tasks: Task[];
}

export const ExportTasksDialog: React.FC<ExportTasksDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  tasks
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [exportType, setExportType] = useState<string>('last-10');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Get unique assignees from tasks
  const assignees = Array.from(new Set(tasks.map(task => task.assignee)));

  const handleExport = () => {
    const options: ExportOptions = {
      exportType: exportType as any,
      assignee: selectedAssignee,
    };

    if (exportType === 'date-range' && startDate && endDate) {
      options.dateRange = { startDate, endDate };
    }

    onExport(options);
    onClose();
  };

  const isFormValid = () => {
    if (!selectedAssignee) return false;
    if (exportType === 'date-range') {
      return startDate && endDate && new Date(startDate) <= new Date(endDate);
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Tasks for Assignee</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="assignee">Select Assignee</Label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Export Options</Label>
            <RadioGroup value={exportType} onValueChange={setExportType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last-10" id="last-10" />
                <Label htmlFor="last-10">Last 10 pending tasks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-pending" id="all-pending" />
                <Label htmlFor="all-pending">All pending tasks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date-range" id="date-range" />
                <Label htmlFor="date-range">Tasks between specific dates</Label>
              </div>
            </RadioGroup>
          </div>

          {exportType === 'date-range' && (
            <div className="space-y-2">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={!isFormValid()}>
              Export Tasks
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
