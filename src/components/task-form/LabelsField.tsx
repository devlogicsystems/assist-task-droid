
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TaskFormData } from '@/lib/validations/task';

export const LabelsField = () => {
  const form = useFormContext<TaskFormData>();
  const [currentLabel, setCurrentLabel] = useState('');
  const labels = form.watch('labels');

  const handleAddLabel = () => {
    if (currentLabel.trim() && !form.getValues('labels').includes(currentLabel.trim())) {
      form.setValue('labels', [...form.getValues('labels'), currentLabel.trim()]);
      setCurrentLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    form.setValue('labels', form.getValues('labels').filter(label => label !== labelToRemove));
  };

  return (
    <div className="space-y-2">
      <Label>Custom Labels</Label>
      <div className="flex gap-2">
        <Input
          value={currentLabel}
          onChange={(e) => setCurrentLabel(e.target.value)}
          placeholder="Add label"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
        />
        <Button type="button" onClick={handleAddLabel} variant="outline" size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {labels.map((label, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleRemoveLabel(label)}
            >
              {label} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
