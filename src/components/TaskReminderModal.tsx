
import React, { useState } from 'react';
import { Task } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, AlarmClock } from 'lucide-react';

interface TaskReminderModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (minutes: number) => void;
  onActionTaken: () => void;
}

const TaskReminderModal: React.FC<TaskReminderModalProps> = ({
  task,
  isOpen,
  onClose,
  onSnooze,
  onActionTaken,
}) => {
  const [customSnoozeMinutes, setCustomSnoozeMinutes] = useState('');
  const [showCustomSnooze, setShowCustomSnooze] = useState(false);

  if (!task) return null;

  const handleCustomSnooze = () => {
    const minutes = parseInt(customSnoozeMinutes);
    if (minutes > 0) {
      onSnooze(minutes);
      setCustomSnoozeMinutes('');
      setShowCustomSnooze(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlarmClock className="w-5 h-5 text-orange-500" />
            Task Reminder
          </DialogTitle>
          <DialogDescription>
            It's time for: <strong>"{task.subject}"</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!showCustomSnooze ? (
            <>
              <Button 
                onClick={() => onSnooze(10)} 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Snooze (10 min)
              </Button>
              
              <Button 
                onClick={() => setShowCustomSnooze(true)} 
                variant="outline" 
                className="w-full"
              >
                Snooze Longer
              </Button>
              
              <Button 
                onClick={() => onSnooze(24 * 60)} 
                variant="outline" 
                className="w-full"
              >
                Snooze till Tomorrow
              </Button>
              
              <Button 
                onClick={onActionTaken} 
                className="w-full flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Action Taken
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="snooze-minutes">Snooze for (minutes):</Label>
                <Input
                  id="snooze-minutes"
                  type="number"
                  value={customSnoozeMinutes}
                  onChange={(e) => setCustomSnoozeMinutes(e.target.value)}
                  placeholder="Enter minutes"
                  min="1"
                  max="1440"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCustomSnooze} className="flex-1">
                  Snooze
                </Button>
                <Button 
                  onClick={() => setShowCustomSnooze(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskReminderModal;
