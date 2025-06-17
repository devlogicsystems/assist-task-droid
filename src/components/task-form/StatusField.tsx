
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { TaskStatus } from '@/types/task';

interface StatusFieldProps {
  value: TaskStatus;
  onChange: (value: TaskStatus) => void;
  disabled?: boolean;
  isClosedTask?: boolean;
}

export const StatusField: React.FC<StatusFieldProps> = ({ value, onChange, disabled, isClosedTask }) => {
  const statuses: { value: TaskStatus; label: string }[] = [
    { value: 'assigned', label: 'Assigned' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select onValueChange={onChange} value={value} disabled={disabled}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {statuses.map(status => (
            <SelectItem 
              key={status.value} 
              value={status.value}
            >
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  );
};
