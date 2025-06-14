
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export const RecurrenceField = () => {
    const { watch, setValue } = useFormContext();
    const recurrence = watch('recurrence');
    
    const [isRecurring, setIsRecurring] = useState(!!recurrence);
    const [type, setType] = useState(recurrence?.type || 'weekly');
    const [weekDay, setWeekDay] = useState(recurrence?.weekDay ?? 1); // Default to Monday
    const [monthDay, setMonthDay] = useState(recurrence?.monthDay ?? 1);
    const [yearMonth, setYearMonth] = useState(recurrence?.monthDate?.month ?? 0);
    const [yearDay, setYearDay] = useState(recurrence?.monthDate?.day ?? 1);

    useEffect(() => {
        if (!isRecurring) {
            setValue('recurrence', undefined);
            return;
        }

        let recurrenceValue: any = { type };
        switch (type) {
            case 'weekly':
                recurrenceValue.weekDay = Number(weekDay);
                break;
            case 'monthly':
                recurrenceValue.monthDay = Number(monthDay);
                break;
            case 'yearly':
                recurrenceValue.monthDate = { month: Number(yearMonth), day: Number(yearDay) };
                break;
        }
        setValue('recurrence', recurrenceValue, { shouldValidate: true });
    }, [isRecurring, type, weekDay, monthDay, yearMonth, yearDay, setValue]);

    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="isRecurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                <Label htmlFor="isRecurring">Set as a recurring task</Label>
            </div>
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
                        <Select value={String(weekDay)} onValueChange={(val) => setWeekDay(Number(val))}>
                            <SelectTrigger><SelectValue placeholder="On..." /></SelectTrigger>
                            <SelectContent>
                                {weekDays.map((day, index) => <SelectItem key={index} value={String(index)}>{day}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    {type === 'monthly' && (
                        <div className="flex items-center gap-2">
                            <Label>On day:</Label>
                            <Input type="number" min="1" max="31" value={monthDay} onChange={(e) => setMonthDay(Number(e.target.value))} className="w-20" />
                        </div>
                    )}
                    {type === 'yearly' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Label>On:</Label>
                            <Select value={String(yearMonth)} onValueChange={(val) => setYearMonth(Number(val))}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Month..." /></SelectTrigger>
                                <SelectContent>
                                    {months.map((month, index) => <SelectItem key={index} value={String(index)}>{month}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input type="number" min="1" max="31" value={yearDay} onChange={(e) => setYearDay(Number(e.target.value))} className="w-20" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
