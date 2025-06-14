
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Mic, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Task, TaskFormData } from '@/types/task';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormData) => void;
  taskToEdit?: Task | null;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit, taskToEdit }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    subject: '',
    details: '',
    assignee: '',
    dueDate: '',
    dueTime: '',
    reminderTime: '',
    isFullDay: false,
    labels: [],
    url: '',
  });
  const [currentLabel, setCurrentLabel] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const isEditing = !!taskToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && taskToEdit) {
        setFormData({
          subject: taskToEdit.subject,
          details: taskToEdit.details || '',
          assignee: taskToEdit.assignee,
          dueDate: taskToEdit.dueDate,
          dueTime: taskToEdit.dueTime || '',
          reminderTime: taskToEdit.reminderTime || '',
          isFullDay: taskToEdit.isFullDay,
          labels: taskToEdit.labels || [],
          url: taskToEdit.url || '',
        });
        if(taskToEdit.url) {
          setShowMoreOptions(true);
        }
      } else {
        setFormData({
          subject: '',
          details: '',
          assignee: '',
          dueDate: '',
          dueTime: '',
          reminderTime: '',
          isFullDay: false,
          labels: [],
          url: '',
        });
        setShowMoreOptions(false);
      }
    }
  }, [isOpen, isEditing, taskToedit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let reminderTime = formData.reminderTime;
    if (!reminderTime && formData.dueTime && !formData.isFullDay) {
      const [hours, minutes] = formData.dueTime.split(':');
      const dueDateTime = new Date();
      dueDateTime.setHours(parseInt(hours), parseInt(minutes) - 10);
      reminderTime = dueDateTime.toTimeString().slice(0, 5);
    } else if (!reminderTime) {
      reminderTime = '09:00';
    }

    onSubmit({ ...formData, reminderTime });
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      subject: '',
      details: '',
      assignee: '',
      dueDate: '',
      dueTime: '',
      reminderTime: '',
      isFullDay: false,
      labels: [],
      url: '',
    });
    setCurrentLabel('');
    setShowMoreOptions(false);
    setIsListening(false);
    onClose();
  };

  const handleAddLabel = () => {
    if (currentLabel.trim() && !formData.labels.includes(currentLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, currentLabel.trim()]
      }));
      setCurrentLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFormData(prev => ({
          ...prev,
          subject: transcript
        }));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Task Subject *</Label>
            <div className="flex gap-2">
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter task subject"
                required
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleVoiceInput}
                variant="outline"
                size="sm"
                className={isListening ? 'bg-red-100' : ''}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Brief Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              placeholder="Enter task details"
              rows={3}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee *</Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
              placeholder="Enter assignee name"
              required
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              min={getTodayDate()}
              required
            />
          </div>

          {/* Full Day Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="fullDay"
              checked={formData.isFullDay}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFullDay: checked }))}
            />
            <Label htmlFor="fullDay">Full Day Task</Label>
          </div>

          {/* Due Time */}
          {!formData.isFullDay && (
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          )}

          {/* Reminder Time */}
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder Time</Label>
            <Input
              id="reminderTime"
              type="time"
              value={formData.reminderTime}
              onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
              placeholder="Default: 10 min before due time"
            />
          </div>

          {/* Labels */}
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
            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.labels.map((label, index) => (
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

          {/* More Options Toggle */}
          <Button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            variant="ghost"
            className="w-full"
          >
            {showMoreOptions ? 'Hide' : 'Show'} More Options
          </Button>

          {/* Additional Options */}
          {showMoreOptions && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="url">Linked URL (Optional)</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleReset} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
