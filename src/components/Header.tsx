
import React from 'react';
import { Plus, Menu as MenuIcon, Download, Upload, Eye, Mic, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useTheme } from '@/hooks/useTheme';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "@/components/ui/menubar";

interface HeaderProps {
  onNewTask: () => void;
  onImport: () => void;
  onExport: () => void;
  onViewCompleted: () => void;
  onVoiceTask: () => void;
  onAddRecurringTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewTask, onImport, onExport, onViewCompleted, onVoiceTask, onAddRecurringTask }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0 opacity-10">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.1">
                <circle cx="30" cy="30" r="2"/>
              </g>
            </g>
          </svg>
        </div>
      </div>
      
      <div className="relative p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Menubar className="bg-transparent border-none p-0 h-auto">
              <MenubarMenu>
                <MenubarTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <MenuIcon className="w-6 h-6" />
                  </Button>
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={onNewTask}>
                    <Plus className="mr-2 h-4 w-4" /> New Task
                  </MenubarItem>
                  <MenubarItem onClick={onAddRecurringTask}>
                    <Repeat className="mr-2 h-4 w-4" /> Add Recurring Task
                  </MenubarItem>
                   <MenubarItem onClick={onVoiceTask}>
                    <Mic className="mr-2 h-4 w-4" /> New Task with Voice
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={onViewCompleted}>
                    <Eye className="mr-2 h-4 w-4" /> View Completed Tasks
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Theme</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarRadioGroup value={theme} onValueChange={(value) => setTheme(value as any)}>
                        <MenubarRadioItem value="light">Light</MenubarRadioItem>
                        <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
                        <MenubarRadioItem value="system">System</MenubarRadioItem>
                      </MenubarRadioGroup>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem onClick={onImport}>
                    <Upload className="mr-2 h-4 w-4" /> Import Tasks
                  </MenubarItem>
                  <MenubarItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" /> Export Tasks
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground">PragmaTasks</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">Organize your work efficiently</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DarkModeToggle />
            <Button
              onClick={onVoiceTask}
              size="icon"
              variant="outline"
              className="bg-transparent text-primary-foreground hover:bg-primary-foreground/10 border-primary-foreground/20 hidden sm:inline-flex"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              onClick={onNewTask}
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 border border-accent shadow-lg font-medium p-2.5 sm:px-3"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </div>
        {/* Stats Cards will be a separate component */}
        {/* The children prop can be used to pass the stats cards */}
      </div>
    </div>
  );
};

export default Header;
