import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './DateRangePicker.css';
import i18n from "i18next";

interface DateRangePickerProps {
    startDate?: string; // ISO or YYYY-MM-DD
    endDate?: string;   // ISO or YYYY-MM-DD
    onChange: (startDate: string, endDate: string) => void;
}

const MONTH_NAMES = {
    sk: ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
        'Júl', 'August', 'September', 'Október', 'November', 'December'],
    en: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
};

const WEEKDAYS = {
    sk: ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
};


export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const { t } = useTranslation();

    const parseDate = (d?: string): Date | null => {
        if (!d) return null;
        if (d.length >= 10) {
            const parts = d.substring(0, 10).split('-');
            if (parts.length === 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                if (!isNaN(y) && !isNaN(m) && !isNaN(day)) {
                    return new Date(y, m, day);
                }
            }
        }
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const initialStart = parseDate(startDate);
    const initialEnd = parseDate(endDate);

    const [rangeStart, setRangeStart] = useState<Date | null>(initialStart);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(initialEnd);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    // Current viewed month
    const [viewDate, setViewDate] = useState<Date>(initialStart || new Date());

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewYear, viewMonth + 1, 1));
    };

    const pad = (n: number) => String(n).padStart(2, '0');

    const emitChange = (start: Date, end: Date) => {
        const startISO = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T00:00:00`;
        const endISO = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T23:59:59`;

        onChange(startISO, endISO);
    };

    const handleDayClick = (dayDate: Date) => {
        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(dayDate);
            setRangeEnd(null);
            emitChange(dayDate, dayDate);
        } else {
            let start = rangeStart;
            let end = dayDate;
            if (dayDate.getTime() < rangeStart.getTime()) {
                start = dayDate;
                end = rangeStart;
            }
            setRangeStart(start);
            setRangeEnd(end);
            emitChange(start, end);
        }
    };

    // Generate days for viewMonth
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Monday-based day of week (0: Mon, 6: Sun)
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const daysArray: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        daysArray.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
        daysArray.push(new Date(viewYear, viewMonth, d));
    }

    const isSameDay = (d1: Date | null, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    const isInRange = (d: Date) => {
        const time = d.getTime();
        const start = rangeStart ? new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate()).getTime() : null;
        const end = rangeEnd
            ? new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate()).getTime()
            : hoverDate && rangeStart
            ? new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate()).getTime()
            : null;

        if (start && end) {
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            return time >= min && time <= max;
        }
        return false;
    };

    const lang = i18n.language === "sk" ? "sk" : "en";
    const monthNames = MONTH_NAMES[lang];
    const weekdays = WEEKDAYS[lang];

    return (
        <div className="dateRangePicker">
            {/* Month Header Navigation */}
            <div className="datePickerHeader">
                <button type="button" className="monthNavBtn" onClick={handlePrevMonth} aria-label={t('previous_month')}>
                    <ChevronLeft size={20} />
                </button>
                <span className="currentMonthLabel">
                    {monthNames[viewMonth]} {viewYear}
                </span>
                <button type="button" className="monthNavBtn" onClick={handleNextMonth} aria-label={t('next_month')}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Weekdays Row */}
            <div className="weekdaysGrid">
                {weekdays.map((w) => (
                    <div key={w} className="weekdayCell">
                        {w}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="daysGrid">
                {daysArray.map((dayDate, idx) => {
                    if (!dayDate) {
                        return <div key={`empty-${idx}`} className="dayCell dayCell--empty" />;
                    }

                    const isStart = isSameDay(dayDate, rangeStart);
                    const isEnd = isSameDay(dayDate, rangeEnd);
                    const inRange = isInRange(dayDate);
                    const isToday = isSameDay(dayDate, new Date());

                    let cellClasses = 'dayCell';
                    if (inRange) cellClasses += ' dayCell--inRange';
                    if (isStart) cellClasses += ' dayCell--start';
                    if (isEnd) cellClasses += ' dayCell--end';
                    if (isToday) cellClasses += ' dayCell--today';

                    return (
                        <button
                            key={dayDate.toISOString()}
                            type="button"
                            className={cellClasses}
                            onClick={() => handleDayClick(dayDate)}
                            onMouseEnter={() => setHoverDate(dayDate)}
                            onMouseLeave={() => setHoverDate(null)}
                        >
                            {dayDate.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Selected Range Summary */}
            <div className="rangeSummaryRow">
                <div className="rangeSummaryInfo">
                    <CalendarIcon size={18} className="rangeSummaryIcon" />
                    <span>
                        {rangeStart ? (
                            <>
                                {rangeStart.toLocaleDateString(lang === 'sk' ? 'sk-SK' : 'en-US')}
                                {' – '}
                                {rangeEnd ? rangeEnd.toLocaleDateString(lang === 'sk' ? 'sk-SK' : 'en-US') : rangeStart.toLocaleDateString(lang === 'sk' ? 'sk-SK' : 'en-US')}
                            </>
                        ) : (
                            t('select_date_range_hint')
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default DateRangePicker;
