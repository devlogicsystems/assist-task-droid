
import React, { useState, useRef } from 'react';
import { useIntelligentVoiceInput } from '@/hooks/useIntelligentVoiceInput';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, requestSystemVTT } = useIntelligentVoiceInput({
    onResult: (transcript) => {
      setCommand(transcript);
    },
    inputRef: textareaRef,
  });
  
  const handleSubmit = () => {
    if (command.trim()) {
      onSubmit(command);
      setCommand('');
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
            Tap the microphone to use your device's voice input, or type your command directly.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            ref={textareaRef}
            placeholder="e.g., 'Remind me to call John tomorrow at 2pm'"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            rows={4}
            className="text-base"
          />
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button 
            onClick={requestSystemVTT} 
            variant="outline" 
            size="icon" 
            className={isListening ? 'bg-red-100 text-red-600' : ''}
            disabled={isListening}
          >
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
