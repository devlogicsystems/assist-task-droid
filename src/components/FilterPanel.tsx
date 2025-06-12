
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Tasks
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <p className="text-muted-foreground">
            Advanced filtering options will be available in the next update.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;
