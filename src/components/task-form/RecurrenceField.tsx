
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export const RecurrenceField = ({ forceRecurring = false }: { forceRecurring?: boolean }) => {
    const { watch, setValue, formState: { errors } } = useFormContext();
    const recurrence = watch('recurrence');
    
    const [isRecurring, setIsRecurring] = useState(forceRecurring || !!recurrence);
    const [type, setType] = useState(recurrence?.type || 'weekly');

    // State for weekly recurrence
    const [weekDays, setWeekDays] = useState<number[]>(recurrence?.weekDays ?? [new Date().getDay()]);
    
    // State for monthly recurrence
    const [monthDays, setMonthDays] = useState<string>(recurrence?.monthDays?.join(', ') ?? '1');

    // State for yearly recurrence
    const [yearDates, setYearDates] = useState<{ month: number; day: number }[]>(recurrence?.yearDates ?? []);
    const [newYearDate, setNewYearDate] = useState({ month: 0, day: 1 });

    useEffect(() => {
        if (!isRecurring) {
            setValue('recurrence', undefined);
            return;
        }

        let recurrenceValue: any = { type };
        switch (type) {
            case 'weekly':
                recurrenceValue.weekDays = weekDays;
                break;
            case 'monthly':
                const parsedMonthDays = monthDays.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v) && v >= 1 && v <= 31);
                recurrenceValue.monthDays = parsedMonthDays;
                break;
            case 'yearly':
                recurrenceValue.yearDates = yearDates;
                break;
        }
        setValue('recurrence', recurrenceValue, { shouldValidate: true });
    }, [isRecurring, type, weekDays, monthDays, yearDates, setValue]);

    const weekDayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleAddYearDate = () => {
        if (newYearDate.day < 1 || newYearDate.day > 31) return;
        if (!yearDates.some(d => d.month === newYearDate.month && d.day === newYearDate.day)) {
            setYearDates([...yearDates, newYearDate].sort((a,b) => a.month - b.month || a.day - b.day));
        }
    };

    const handleRemoveYearDate = (index: number) => {
        setYearDates(yearDates.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {!forceRecurring && (
                <div className="flex items-center space-x-2">
                    <Switch id="isRecurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                    <Label htmlFor="isRecurring">Set as a recurring task</Label>
                </div>
            )}
            {isRecurring && (
                <div className="pl-6 space-y-4 border-l-2 border-muted-foreground/20">
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger><SelectValue placeholder="Repeats..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    {type === 'weekly' && (
                        <div className="space-y-2">
                            <Label>On days:</Label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {weekDayLabels.map((day, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`weekday-${index}`}
                                            checked={weekDays.includes(index)}
                                            onCheckedChange={(checked) => {
                                                const newWeekDays = checked ? [...weekDays, index] : weekDays.filter((d) => d !== index);
                                                setWeekDays(newWeekDays.sort());
                                            }}
                                        />
                                        <Label htmlFor={`weekday-${index}`} className="font-normal">{day}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {type === 'monthly' && (
                        <div className="space-y-2">
                            <Label htmlFor="month-days">On days of month (comma-separated):</Label>
                            <Input id="month-days" type="text" placeholder="e.g., 1, 15, 30" value={monthDays} onChange={(e) => setMonthDays(e.target.value)} />
                        </div>
                    )}
                    {type === 'yearly' && (
                        <div className="space-y-2">
                            <Label>On specific dates:</Label>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Select value={String(newYearDate.month)} onValueChange={(val) => setNewYearDate(p => ({...p, month: Number(val)}))}>
                                    <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-40"><SelectValue placeholder="Month..." /></SelectTrigger>
                                    <SelectContent>
                                        {months.map((month, index) => <SelectItem key={index} value={String(index)}>{month}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input type="number" min="1" max="31" value={newYearDate.day} onChange={(e) => setNewYearDate(p => ({...p, day: Number(e.target.value)}))} className="w-20" />
                                <Button type="button" onClick={handleAddYearDate} size="sm">Add Date</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {yearDates.map((date, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {months[date.month]} {date.day}
                                        <button type="button" onClick={() => handleRemoveYearDate(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                     {errors.recurrence && <p className="text-sm font-medium text-destructive">{errors.recurrence.message?.toString()}</p>}
                </div>
            )}
        </div>
    );
};
