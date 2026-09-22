import './LessonItem.css';
import i18n from "i18next";

interface LessonItemProps {
    weekday: number;
    time: string;
    title: string;
    teacher: string;
    room: string;
    type?: string;
}

function getNextOccurrence(weekday: number, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();

    const result = new Date(now);
    result.setHours(hours, minutes, 0, 0);

    // DB: 0=Mon..4=Fri; JS getDay(): 0=Sun,1=Mon..6=Sat → convert
    const jsWeekday = (weekday + 1) % 7;
    let diff = (jsWeekday - now.getDay() + 7) % 7;
    if (diff === 0 && result <= now) diff = 7;

    result.setDate(now.getDate() + diff);
    return result;
}

function LessonItem({ weekday, time, title, teacher, room, type }: LessonItemProps) {

    const date = getNextOccurrence(weekday, time);

    const locale = i18n.language === "sk" ? "sk-SK" : "en-US";

    const dayNumber = date.getDate();
    const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' })
        .format(date)
        .replace('.', '');

    const isLecture = type?.toLowerCase() === 'lecture';


    return (
        <div className={`lessonItem ${isLecture ? 'lessonItem--lecture' : 'lessonItem--practice'}`}>
            <div className="lessonDate">
                <span className="lessonDay">{dayNumber}</span>
                <span className="lessonWeekday">{weekdayShort}</span>
            </div>
            <div className="lessonBody">
                <div className="lessonHeaderRow">
                    <p className="lessonTitle">{title} - {time}</p>
                </div>
                <p className="lessonSubtitle">{teacher}, {room}</p>
            </div>
        </div>
    );
}

export default LessonItem;