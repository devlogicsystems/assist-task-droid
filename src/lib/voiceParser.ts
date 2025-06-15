
import { addDays, format } from 'date-fns';

interface ParsedTaskData {
  subject?: string;
  dueDate?: string;
  dueTime?: string;
  assignee?: string;
  isFullDay?: boolean;
  reminderTime?: string;
}

const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

const parseTime = (timeStr: string): string | undefined => {
  const timeLower = timeStr.toLowerCase();
  const match = timeLower.match(/(\d{1,2})[:\.]?(\d{2})?\s*(am|pm)?/);
  if (!match) return undefined;
  
  let [_, hoursStr, minutesStr, period] = match;
  let hours = parseInt(hoursStr, 10);
  let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
  
  if (period === 'pm' && hours < 12) {
    hours += 12;
  }
  if (period === 'am' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const parseVoiceCommand = (command: string): ParsedTaskData => {
  const data: ParsedTaskData = { isFullDay: false };
  const lowerCommand = command.toLowerCase();

  // 1. Assignee
  const assigneeMatch = lowerCommand.match(/assign(?: this)? task to (.*?)(?:\.|$| due| and| at)/i);
  if (assigneeMatch && assigneeMatch[1]) {
    const assignee = assigneeMatch[1].trim();
    data.assignee = assignee.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
  }

  // 2. Full Day Task
  if (lowerCommand.includes('full day task')) {
    data.isFullDay = true;
  }

  // 3. Due Date
  const today = new Date();
  if (lowerCommand.includes('tomorrow')) {
    data.dueDate = formatDate(addDays(today, 1));
  } else if (lowerCommand.includes('today')) {
    data.dueDate = formatDate(today);
  } else {
    const nextDaysMatch = lowerCommand.match(/in (?:next )?(\d+)\s+days?/i);
    if (nextDaysMatch && nextDaysMatch[1]) {
      const days = parseInt(nextDaysMatch[1], 10);
      data.dueDate = formatDate(addDays(today, days));
    }
  }

  // 4. Due Time
  if (!data.isFullDay) {
    const timeMatch = lowerCommand.match(/(?:due time (?:will be|is)?|at) (.*?)(?:\.|$| and| assign)/i);
    if (timeMatch && timeMatch[1]) {
      data.dueTime = parseTime(timeMatch[1].trim());
    } else if (data.dueDate) {
      data.dueTime = '10:00';
    }
  }

  // 5. Subject
  const subjectMatch = lowerCommand.match(/(?:create a task as|task as|subject is|call it|task is) (.*?)(?:\.|$| due| and| assign| at)/i);
  if (subjectMatch && subjectMatch[1]) {
    let subject = subjectMatch[1].trim();
    data.subject = subject.charAt(0).toUpperCase() + subject.slice(1);
  }

  // 6. Reminder Time Calculation
  if (data.isFullDay) {
    data.reminderTime = '10:00';
  } else if (data.dueTime) {
    const [hours, minutes] = data.dueTime.split(':').map(Number);
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes - 10);
    data.reminderTime = `${String(reminderDate.getHours()).padStart(2, '0')}:${String(reminderDate.getMinutes()).padStart(2, '0')}`;
  }


  return data;
};
