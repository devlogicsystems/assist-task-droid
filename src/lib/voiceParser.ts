
import { addDays, format } from 'date-fns';

interface ParsedTaskData {
  subject?: string;
  dueDate?: string;
  dueTime?: string;
  assignee?: string;
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
  const data: ParsedTaskData = {};
  const lowerCommand = command.toLowerCase();

  // 1. Assignee
  const assigneeMatch = lowerCommand.match(/assign(?: this)? task to (.*?)(?:\.|$| due| and| at)/i);
  if (assigneeMatch && assigneeMatch[1]) {
    const assignee = assigneeMatch[1].trim();
    data.assignee = assignee.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
  }

  // 2. Due Date
  const today = new Date();
  if (lowerCommand.includes('tomorrow')) {
    data.dueDate = formatDate(addDays(today, 1));
  } else if (lowerCommand.includes('today')) {
    data.dueDate = formatDate(today);
  }

  // 3. Due Time
  const timeMatch = lowerCommand.match(/(?:due time (?:will be|is)?|at) (.*?)(?:\.|$| and| assign)/i);
  if (timeMatch && timeMatch[1]) {
    data.dueTime = parseTime(timeMatch[1].trim());
  }

  // 4. Subject
  const subjectMatch = lowerCommand.match(/(?:create a task as|task as|subject is|call it|task is) (.*?)(?:\.|$| due| and| assign| at)/i);
  if (subjectMatch && subjectMatch[1]) {
    let subject = subjectMatch[1].trim();
    data.subject = subject.charAt(0).toUpperCase() + subject.slice(1);
  }

  return data;
};
