
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { useTaskCardLogic } from '@/hooks/useTaskCardLogic';
import TaskCardHeader from './task-card/TaskCardHeader';
import TaskCardExpandedContent from './task-card/TaskCardExpandedContent';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    getStatusColor,
    getStatusIcon,
    getNextStatus,
    formatDateTime,
    isOverdue,
    isEditable,
  } = useTaskCardLogic(task);

  const handleStatusChange = () => {
    const nextStatus = getNextStatus(task.status);
    onUpdate({ ...task, status: nextStatus });
  };
  
  const handleEdit = () => {
    onEdit(task);
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  }

  return (
    <div className={`list-item ${isExpanded ? 'list-item-expanded' : ''} ${isOverdue && task.status !== 'closed' ? 'border-l-4 border-l-destructive' : ''}`}>
      <TaskCardHeader
        task={task}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        isOverdue={isOverdue}
        isEditable={isEditable}
        statusColor={getStatusColor(task.status)}
        statusIcon={getStatusIcon(task.status)}
        formattedDateTime={formatDateTime()}
      />

      {isExpanded && <TaskCardExpandedContent task={task} />}
    </div>
  );
};

export default TaskCard;
