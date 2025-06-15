
import React, { useState, useEffect } from 'react';
import { useSimpleVoiceRecognition } from '@/hooks/useSimpleVoiceRecognition';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send } from 'lucide-react';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: string) => void;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [command, setCommand] = useState('');

  const { isListening, startListening, stopListening } = useSimpleVoiceRecognition({
    onResult: (transcript) => {
      setCommand(transcript);
    },
  });

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    
    return () => {
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);
  
  const handleSubmit = () => {
    if (command.trim()) {
      onSubmit(command);
    }
  };
  
  const handleClose = () => {
    setCommand('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task with Voice</DialogTitle>
          <DialogDescription>
            Speak your command. The system will listen until you close this window or click Create Task.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="e.g., 'Remind me to call John tomorrow at 2pm'"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            rows={4}
            className="text-base"
          />
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button onClick={isListening ? stopListening : startListening} variant="outline" size="icon" className={isListening ? 'bg-red-100' : ''}>
            <Mic />
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!command.trim()}>
              <Send className="w-4 h-4 mr-2" /> Create Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
