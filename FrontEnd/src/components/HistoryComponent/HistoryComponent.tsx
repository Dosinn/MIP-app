import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './HistoryComponent.css';
import type { HistoryElement } from '../../api/schemas/ProjectSchema.ts';
import formatName from '../../utils/formatName.ts';
import { formatCommentDate } from '../../utils/formatDates.ts';

interface TeacherCommentsProps {
    comments: HistoryElement[] | null | undefined;
}

function HistoryComponent({ comments }: TeacherCommentsProps) {
    const { t } = useTranslation();

    if (comments == null || comments.length === 0) {
        return (
            <div className="commentsEmpty">
                <Clock size={32} strokeWidth={1.5} />
                <p>{t('no_comments_text')}</p>
            </div>
        );
    }

    return (
        <div className="teacherComments">
            {comments.map((comment) => (
                <div key={comment.id} className="commentItem">
                    <div className="commentBody">
                        <p className="commentAuthor">
                            <span className={`commentStatusWord commentStatusWord--${comment.status}`}>
                                {t(`comment_status_word_${comment.status}`)}
                            </span>{' '}
                            {comment.teacher ? t('comment_by', { name: formatName(comment.teacher.name) }) : ''}
                        </p>
                        {comment.message && <p className="commentMessage">{comment.message}</p>}
                        <p className="commentDate">{formatCommentDate(comment.date)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HistoryComponent;