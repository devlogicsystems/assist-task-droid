
import { addDays, format, addMinutes, addHours } from 'date-fns';

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

  // 3. Due Date and Time from relative phrases
  const now = new Date();
  const minutesMatch = lowerCommand.match(/in (?:next )?(\d+)\s+minutes?/i);
  const hoursMatch = lowerCommand.match(/in (?:next )?(\d+)\s+hours?/i);

  if (minutesMatch && minutesMatch[1]) {
    const minutes = parseInt(minutesMatch[1], 10);
    const dueDate = addMinutes(now, minutes);
    data.dueDate = format(dueDate, 'yyyy-MM-dd');
    data.dueTime = format(dueDate, 'HH:mm');
  } else if (hoursMatch && hoursMatch[1]) {
    const hours = parseInt(hoursMatch[1], 10);
    const dueDate = addHours(now, hours);
    data.dueDate = format(dueDate, 'yyyy-MM-dd');
    data.dueTime = format(dueDate, 'HH:mm');
  } else if (lowerCommand.includes('tomorrow')) {
    data.dueDate = formatDate(addDays(now, 1));
  } else if (lowerCommand.includes('today')) {
    data.dueDate = formatDate(now);
  } else {
    const nextDaysMatch = lowerCommand.match(/in (?:next )?(\d+)\s+days?/i);
    if (nextDaysMatch && nextDaysMatch[1]) {
      const days = parseInt(nextDaysMatch[1], 10);
      data.dueDate = formatDate(addDays(now, days));
    } else {
      const monthNames = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec';
      const dateMatch = lowerCommand.match(new RegExp(`\\bon\\s+(${monthNames})\\s+(\\d{1,2})`, 'i'));
      
      if (dateMatch) {
        const monthStr = dateMatch[1].toLowerCase();
        const day = parseInt(dateMatch[2], 10);

        const monthMap: { [key: string]: number } = {
            jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4,
            jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
            oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
        };
        const month = monthMap[monthStr];

        if (month !== undefined) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let year = today.getFullYear();
            const prospectiveDate = new Date(year, month, day);
            
            if (prospectiveDate < today) {
                year++;
            }
            
            const dueDate = new Date(year, month, day);
            data.dueDate = formatDate(dueDate);
        }
      }
    }
  }

  // 4. Due Time (if not set by relative phrases)
  if (!data.dueTime && !data.isFullDay) {
    const timeMatch = lowerCommand.match(/(?:due time (?:will be|is)?|at) (.*?)(?:\.|$| and| assign)/i);
    if (timeMatch && timeMatch[1]) {
      data.dueTime = parseTime(timeMatch[1].trim());
    } else if (data.dueDate) {
      data.dueTime = '10:00';
    }
  }

  // 5. Subject
  const subjectMatch = lowerCommand.match(/(?:create a task as|task as|subject is|call it|task is|remind me to) (.*?)(?:\.|$| due| and| assign| at| tomorrow| today| in| on)/i);
  if (subjectMatch && subjectMatch[1]) {
    let subject = subjectMatch[1].trim();
    // Handle cases like "remind me to create a task as..."
    const nestedSubjectMatch = subject.match(/(?:create a task as|task as|subject is|call it|task is) (.*)/i);
    if (nestedSubjectMatch && nestedSubjectMatch[1]) {
        subject = nestedSubjectMatch[1].trim();
    }
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
