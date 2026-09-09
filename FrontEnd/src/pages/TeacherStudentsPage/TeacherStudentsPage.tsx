import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Users,} from 'lucide-react';
import {useTeacherAllReviews} from '../../hooks/useProjects.ts';
import {useSearchStudents} from '../../hooks/useUsers.ts';
import {useMyLessons} from '../../hooks/useLessons.ts';
import QueryState from '../../components/QueryState/QueryState.tsx';
import SessionTabs from '../TeacherPage/components/SessionTabs/SessionTabs.tsx';
import type {ProjectReview} from '../../api/schemas/ProjectSchema.ts';
import type {User} from '../../api/schemas/PeopleSchema.ts';
import './TeacherStudentsPage.css';
import UserAvatar from "../../components/UserAvatar/UserAvatar.tsx";
import TeamMembersList from "../../components/TeamMembersList/TeamMembersList.tsx";

function TeacherStudentsPage() {
    const {t} = useTranslation();

    const [viewMode, setViewMode] = useState<'teams' | 'unassigned'>('teams');
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

    const {
        data: lessons = [],
        isPending: loadingLessons,
        isError: lessonsError,
        refetch: refetchLessons,
    } = useMyLessons();

    const {
        data: allReviewsRaw,
        isPending: loadingReviews,
        isError: reviewsError,
        refetch: refetchReviews,
    } = useTeacherAllReviews();
    const allReviews = allReviewsRaw ?? [];

    const {
        data: allStudentsRaw,
        isPending: loadingStudents,
        isError: studentsError,
        refetch: refetchStudents,
    } = useSearchStudents('');
    const allStudents = allStudentsRaw ?? [];

    useEffect(() => {
        if (lessons.length > 0 && activeLessonId === null) {
            setActiveLessonId(lessons[0].id);
        }
    }, [lessons, activeLessonId]);

    const reviewsForLesson = useMemo(() => {
        if (activeLessonId === null) return allReviews;
        return allReviews.filter((r) => r.lessonId === activeLessonId);
    }, [allReviews, activeLessonId]);

    const assignedStudentIds = useMemo(() => {
        const set = new Set<number>();
        allReviews.forEach((review) => {
            review.team?.members?.forEach((member) => {
                if (member.id) set.add(member.id);
            });
        });
        return set;
    }, [allReviews]);

    const unassignedStudents = useMemo(() => {
        return allStudents.filter((s) => !assignedStudentIds.has(s.id));
    }, [allStudents, assignedStudentIds]);

    const isPageLoading = loadingLessons || loadingReviews || loadingStudents;
    const hasPageError = reviewsError || studentsError;

    const handleRetry = () => {
        refetchReviews();
        refetchStudents();
        refetchLessons();
    };

    if (isPageLoading || hasPageError) {
        return (
            <div className="teacherStudentsPage">
                <QueryState
                    isPending={isPageLoading}
                    isError={Boolean(hasPageError)}
                    onRetry={handleRetry}
                    errorMessageKey="generic_error_text"
                    size="page"
                />
            </div>
        );
    }

    return (
        <div className="teacherStudentsPage">
            <div className="teacherStudentsHeader">
                <h1 className="teacherStudentsTitle">{t('teacher_classes_title')}</h1>
            </div>

            <QueryState
                isPending={loadingLessons}
                isError={lessonsError}
                onRetry={refetchLessons}
                errorMessageKey="failed_to_load_teacher"
            >
                {lessons.length > 0 ? (
                    <SessionTabs
                        lessons={lessons}
                        activeId={activeLessonId}
                        onChange={setActiveLessonId}
                    />
                ) : (
                    <p className="teacherEmptyState">{t('teacher_no_lessons_msg')}</p>
                )}
            </QueryState>

            <div className="sessionTabs sessionTabsSecondLevel" style={{marginTop: '8px'}}>
                <button
                    type="button"
                    className={`sessionTab ${viewMode === 'teams' ? 'sessionTabActiveSecondLevel' : ''}`}
                    onClick={() => setViewMode('teams')}
                >
                    {t('teams_tab')} ({reviewsForLesson.length})
                </button>
                <button
                    type="button"
                    className={`sessionTab sessionTabSecondLevel ${viewMode === 'unassigned' ? 'sessionTabActiveSecondLevel' : ''}`}
                    onClick={() => setViewMode('unassigned')}
                >
                    {t('unassigned_students_tab')} ({unassignedStudents.length})
                </button>
            </div>

            {viewMode === 'teams' ? (
                <div className="teamsList">
                    {reviewsForLesson.length === 0 ? (
                        <div className="emptyStateBox">
                            <Users size={36} className="emptyStateIcon"/>
                            <p>{t('no_teams_found_search')}</p>
                        </div>
                    ) : (
                        reviewsForLesson.map((review: ProjectReview, idx: number) => (
                            <div key={review.id || idx} className="teamCard">
                                <div className="teamCardTop">
                                    <span className="teamTag">{t('team_name_text')} #{review.team?.id ?? idx + 1}</span>
                                </div>
                                <TeamMembersList
                                    members={review.team?.members ?? []}
                                    teamId={review.team?.id}
                                    onMemberRemoved={() => {
                                        refetchReviews();
                                        refetchStudents();
                                    }}
                                />
                            </div>
                        )))
                    }
                </div>
            ) : (
                <div className="unassignedList">
                    {unassignedStudents.length === 0 ? (
                        <div className="emptyStateBox">
                            <Users size={36} className="emptyStateIcon"/>
                            <p>{t('all_students_in_teams_celebration')}</p>
                        </div>
                    ) : (
                        unassignedStudents.map((student: User) => (
                            <div key={student.id} className="unassignedCard">
                                <UserAvatar name={student.name} size={46}/>
                                <div className="unassignedDetails">
                                    <span className="unassignedName">{student.name}</span>
                                    <span className="unassignedEmail">{student.email}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default TeacherStudentsPage;
