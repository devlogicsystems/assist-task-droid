
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { useTaskCardLogic } from '@/hooks/useTaskCardLogic';
import TaskCardHeader from './task-card/TaskCardHeader';
import TaskCardExpandedContent from './task-card/TaskCardExpandedContent';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    getStatusColor,
    getStatusIcon,
    getNextStatus,
    formatDateTime,
    isOverdue,
    isEditable,
  } = useTaskCardLogic(task);
  
  const isTemplate = !!task.recurrence;

  const handleStatusChange = () => {
    if (isTemplate) {
      const newStatus = (task.templateStatus === 'active' || typeof task.templateStatus === 'undefined') ? 'inactive' : 'active';
      onUpdate({ ...task, templateStatus: newStatus });
    } else {
      const nextStatus = getNextStatus(task.status);
      onUpdate({ ...task, status: nextStatus });
    }
  };
  
  const handleEdit = () => {
    onEdit(task);
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleMakeRecurring = () => {
    if (task.recurrence) return;

    const basisDate = task.dueDate ? new Date(`${task.dueDate}T00:00:00`) : new Date();
    if (isNaN(basisDate.getTime())) {
      basisDate.setTime(new Date().getTime());
    }

    onUpdate({
      ...task,
      recurrence: {
        type: 'weekly',
        weekDays: [basisDate.getDay()],
        interval: 1,
      },
    });
  };

  return (
    <div className={`list-item ${isExpanded ? 'list-item-expanded' : ''} ${isOverdue && task.status !== 'closed' ? 'border-l-4 border-l-destructive' : ''}`}>
      <TaskCardHeader
        task={task}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        isOverdue={isOverdue}
        isEditable={isEditable}
        statusColor={getStatusColor(task.status)}
        statusIcon={getStatusIcon(task.status)}
        formattedDateTime={formatDateTime()}
        isTemplate={isTemplate}
      />

      {isExpanded && <TaskCardExpandedContent task={task} onMakeRecurring={handleMakeRecurring} />}
    </div>
  );
};

export default TaskCard;
