import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import SessionTabs from './components/SessionTabs/SessionTabs';
import TeamReviewCard from './components/TeamReviewCard/TeamReviewCard';
import QueryState from '../../components/QueryState/QueryState.tsx';

import './TeacherPage.css';
import {useLessonReviews, useMyLessons, useTeacherLessons} from '../../hooks/useLessons.ts';
import {useTeachers} from '../../hooks/useUsers.ts';
import {useAuth} from '../../context/AuthContext.tsx';

import CreateLessonModal from '../../components/CreateLessonModal/CreateLessonModal.tsx';
import {Plus} from 'lucide-react';
import type {Teacher} from '../../api/schemas/PeopleSchema.ts';

function TeacherPage() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {user} = useAuth();
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const {data: teachers = []} = useTeachers();
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

    useEffect(() => {
        if (isAdmin && teachers.length > 0 && selectedTeacherId === null) {
            setSelectedTeacherId(teachers[0].id);
        }
    }, [isAdmin, teachers, selectedTeacherId]);

    const {
        data: myLessons = [],
        isPending: loadingMyLessons,
        isError: myLessonsError,
        refetch: refetchMyLessons
    } = useMyLessons();
    const {
        data: teacherLessons = [],
        isPending: loadingTeacherLessons,
        isError: teacherLessonsError
    } = useTeacherLessons(
        isAdmin ? selectedTeacherId ?? undefined : undefined
    );

    const lessons = isAdmin ? teacherLessons : myLessons;
    const loadingLessons = isAdmin ? loadingTeacherLessons : loadingMyLessons;
    const lessonsError = isAdmin ? teacherLessonsError : myLessonsError;
    const refetchLessons = refetchMyLessons;

    const [activeSession, setActiveSession] = useState<number | null>(null);
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);

    useEffect(() => {
        setActiveSession(null);
    }, [selectedTeacherId]);

    useEffect(() => {
        if (lessons.length > 0 && activeSession === null) {
            setActiveSession(lessons[0].id);
        }
    }, [lessons, activeSession]);

    const {
        data: reviewProjects = [],
        isPending: loadingReviews,
        isError: reviewsError,
        refetch: refetchReviews,
    } = useLessonReviews(activeSession);

    const sortedReviews = useMemo(() => {
        const statusOrder: Record<string, number> = {
            pending: 0,
            returned_by_teacher: 1,
            returned: 2,
            approved: 3,
        };
        return [...reviewProjects].sort((a, b) => {
            const orderA = statusOrder[a.reviewStatus?.toLowerCase() ?? ''] ?? 99;
            const orderB = statusOrder[b.reviewStatus?.toLowerCase() ?? ''] ?? 99;
            return orderA - orderB;
        });
    }, [reviewProjects]);

    return (
        <div className="teacherPage">
            <div className="teacherStudentsHeader">
                <h1 className="teacherStudentsTitle">{t('teacher_projects_title')}</h1>
            </div>

            {!isAdmin && (
                <div className="teacherAddBtnRow">
                    <button
                        type="button"
                        className="adminAddBtn"
                        onClick={() => setIsAddLessonOpen(true)}
                        title={t('add_lesson_btn')}
                    >
                        <Plus size={18}/>
                        <span>{t('add_lesson_btn')}</span>
                    </button>
                </div>
            )}

            {/* Admin-only: teacher selector tabs */}
            {isAdmin && (
                <div className="teacherFilterRow">
                    <div className="sessionTabs">
                        {teachers.map((teacher: Teacher) => (
                            <button
                                key={teacher.id}
                                type="button"
                                className={`sessionTab ${selectedTeacherId === teacher.id ? 'sessionTabActive' : ''}`}
                                onClick={() => setSelectedTeacherId(teacher.id)}
                            >
                                {teacher.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Lesson tabs */}
            <QueryState
                isPending={loadingLessons}
                isError={lessonsError}
                onRetry={refetchLessons}
                errorMessageKey="failed_to_load_teacher"
            >
                {lessons.length > 0 ? (
                    <SessionTabs
                        lessons={lessons}
                        activeId={activeSession}
                        onChange={setActiveSession}
                        level={isAdmin ? 2 : null}
                    />
                ) : (
                    <p className="teacherEmptyState">{t('teacher_no_lessons_msg')}</p>
                )}
            </QueryState>

            <QueryState
                isPending={loadingReviews}
                isError={reviewsError}
                onRetry={refetchReviews}
                errorMessageKey="failed_to_load_project"
            >
                <div className="projectList">
                    {sortedReviews.length === 0 && !loadingReviews ? (
                        <p className="teacherEmptyState">{t('teacher_empty_state_msg')}</p>
                    ) : (
                        sortedReviews.map((project) => (
                            <TeamReviewCard
                                key={project.id}
                                project={project}
                                onClick={() =>
                                    navigate(`/teacher/review/${project.id}`, {
                                        state: {projectTitle: project.title},
                                    })
                                }
                            />
                        ))
                    )}
                </div>
            </QueryState>

            <CreateLessonModal
                isOpen={isAddLessonOpen}
                onClose={() => setIsAddLessonOpen(false)}
                teacherId={user?.id}
                onSuccess={() => {
                    refetchLessons();
                }}
            />
        </div>
    );
}

export default TeacherPage;