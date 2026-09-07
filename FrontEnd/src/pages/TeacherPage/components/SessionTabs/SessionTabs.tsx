import './SessionTabs.css';
import type { LessonResponse } from '../../../../api/schemas/PeopleSchema.ts';
import { formatLesson } from '../../../../utils/formatDates.ts';

interface SessionTabsProps {
    lessons: LessonResponse[];
    activeId: number | null;
    onChange: (id: number) => void;
    level?: number | null;
}

function SessionTabs({ lessons, activeId, onChange, level }: SessionTabsProps) {
    return (
        <div className="sessionTabs">
            {lessons.map((lesson) => (
                <button
                    key={lesson.id}
                    className={`sessionTab ${activeId === lesson.id ? level === 2 ? 'sessionTabActiveSecondLevel' : 'sessionTabActive' : ''}`}
                    onClick={() => onChange(lesson.id)}
                >
                    {formatLesson(lesson.dayOfWeek, lesson.hour)}
                </button>
            ))}
        </div>
    );
}

export default SessionTabs;