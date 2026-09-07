import { formatCommentDate } from "../../../../utils/formatDates.ts";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import './UrgentDeadlines.css';

export interface Deadline {
    id: number;
    title: string;
    dueDate: string;
}

interface UrgentDeadlinesProps {
    deadline: Deadline | null;
}

function UrgentDeadlines({ deadline }: UrgentDeadlinesProps) {

    const { t } = useTranslation();

    if (!deadline) {return null;}

    return (
            <div className=" urgentItem" key={deadline.id}>
                <Clock size={24} strokeWidth={2} color="var(--color-red-500)"/>
                <div className="urgentLine">
                    <p className="urgentTitle">{deadline.title}</p>
                    <p className="urgentDate"><strong>{t('due_prefix')}</strong> {formatCommentDate(deadline.dueDate)}</p>
                </div>
            </div>
    );
}

export default UrgentDeadlines;