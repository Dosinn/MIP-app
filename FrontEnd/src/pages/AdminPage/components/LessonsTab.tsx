import {Edit2, Plus, Trash2} from "lucide-react";
import QueryState from "../../../components/QueryState/QueryState.tsx";
import type {LessonResponse, Teacher} from "../../../api/schemas/PeopleSchema.ts";
import UserAvatar from "../../../components/UserAvatar/UserAvatar.tsx";
import {useDeleteLesson} from "../../../hooks/useLessons.ts";
import CreateLessonModal from "../../../components/CreateLessonModal/CreateLessonModal.tsx";
import {useState} from "react";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal.tsx";
import {useTranslation} from "react-i18next";
import {useToast} from "../../../components/Toast/ToastContext.tsx";
import getApiErrorMessage from "../../../utils/errorHandler.ts";
import type {UseQueryResult} from "@tanstack/react-query";


interface LessonsTabProps {
    teachersQuery: UseQueryResult<Teacher[]>;
    lessonsQuery: UseQueryResult<LessonResponse[]>;
}

export function LessonsTab({teachersQuery, lessonsQuery}: LessonsTabProps) {

    const {t} = useTranslation();
    const {showSuccess, showError} = useToast();

    const {
        data: teachers = [],
        isPending: loadingTeachers,
        isError: teachersError,
        refetch: refetchTeachers
    } = teachersQuery
    const {
        data: allLessons = [],
        isPending: loadingLectures,
        isError: lecturesError,
        refetch: refetchLectures
    } = lessonsQuery;

    const lectures = allLessons.filter((l) => l.type?.toUpperCase() === 'LECTURE');

    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [selectedTeacherForLesson, setSelectedTeacherForLesson] = useState<Teacher | null>(null);
    const [editingLessonForModal, setEditingLessonForModal] = useState<LessonResponse | null>(null);
    const [lessonModalDefaultType, setLessonModalDefaultType] = useState<'PRACTICE' | 'LECTURE'>('PRACTICE');

    const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

    const deleteLessonMutation = useDeleteLesson();
    const handleConfirmDeleteLesson = async () => {
        if (!lessonToDelete) return;
        try {
            await deleteLessonMutation.mutateAsync(lessonToDelete);
            showSuccess(t('lesson_deleted_success'));
            refetchTeachers();
        } catch (err) {
            showError(getApiErrorMessage(err));
        } finally {
            setLessonToDelete(null);
        }
    };

    return (
        <>
            <div className="adminTabContent">
                <div className="adminSectionActions">
                    <h2 className="adminSectionHeading">{t('lecture_section_heading')}</h2>
                    {lectures.length === 0 && (
                        <button
                            type="button"
                            className="adminAddBtn"
                            onClick={() => {
                                setEditingLessonForModal(null);
                                setSelectedTeacherForLesson(null);
                                setLessonModalDefaultType('LECTURE');
                                setIsLessonModalOpen(true);
                            }}
                        >
                            <Plus size={16}/>
                            <span>{t('add_lecture_btn')}</span>
                        </button>
                    )}
                </div>

                <QueryState
                    isPending={loadingLectures}
                    isError={lecturesError}
                    onRetry={refetchLectures}
                    errorMessageKey="failed_to_load_teacher"
                >
                    {lectures.length === 0 ? (
                        <p className="teacherEmptyState">{t('no_lectures_found')}</p>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            {lectures.map((les) => {
                                const dayNames = [
                                    t('day_monday'),
                                    t('day_tuesday'),
                                    t('day_wednesday'),
                                    t('day_thursday'),
                                    t('day_friday'),
                                ];
                                return (
                                    <div key={les.id} className="adminLectureCard">
                                        <div className="adminLectureDate">
                                                <span className="adminLectureWeekday">
                                                    {(dayNames[les.dayOfWeek] ?? 'Pondelok').slice(0, 2)}
                                                </span>
                                        </div>
                                        <div className="adminLectureCardInfo">
                                            <div className="adminLectureDetails">
                                                        <span className="adminLectureTime">
                                                            {dayNames[les.dayOfWeek] ?? 'Pondelok'} {les.hour}:00 – {les.endHour ?? (les.hour + 3)}:00
                                                        </span>
                                            </div>
                                            {les.room && (
                                                <span className="adminLectureRoom">
                                                        {les.room}
                                                    </span>
                                            )}
                                        </div>
                                        <div className="adminScheduleRowActions">
                                            <button
                                                type="button"
                                                className="adminControlBtn adminControlBtn--edit"
                                                onClick={() => {
                                                    setEditingLessonForModal(les);
                                                    setSelectedTeacherForLesson(null);
                                                    setLessonModalDefaultType('LECTURE');
                                                    setIsLessonModalOpen(true);
                                                }}
                                                title={t('edit_lecture')}
                                            >
                                                <Edit2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </QueryState>

                <div className="adminSectionActions" style={{marginTop: '1.75rem'}}>
                    <div>
                        <h2 className="adminSectionHeading">{t('practices_section_heading')}</h2>
                    </div>
                </div>

                <QueryState
                    isPending={loadingLectures || loadingTeachers}
                    isError={lecturesError || teachersError}
                    onRetry={() => {
                        refetchLectures();
                        refetchTeachers();
                    }}
                    errorMessageKey="failed_to_load_teacher"
                >
                    {teachers.length === 0 ? (
                        <p className="teacherEmptyState">{t('no_teachers_found')}</p>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                            {teachers.map((teacher: Teacher) => {
                                const teacherPractices = allLessons.filter(
                                    (l) => l.type?.toUpperCase() !== 'LECTURE' && (l.teacherId === teacher.id || l.teacherName === teacher.name)
                                );
                                const dayNames = [
                                    t('day_monday'),
                                    t('day_tuesday'),
                                    t('day_wednesday'),
                                    t('day_thursday'),
                                    t('day_friday'),
                                ];

                                return (
                                    <div key={teacher.id} className="adminTeacherGroupCard">
                                        <div className="adminTeacherGroupHeader">
                                            <div className="adminTeacherGroupHeaderLeft">
                                                <UserAvatar name={teacher.name} size={46}/>
                                                <div>
                                                    <h3 className="adminTeacherGroupName">{teacher.name}</h3>
                                                    {teacher.email && (
                                                        <p className="adminTeacherGroupEmail">{teacher.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="adminAddBtn"
                                                onClick={() => {
                                                    setEditingLessonForModal(null);
                                                    setSelectedTeacherForLesson(teacher);
                                                    setLessonModalDefaultType('PRACTICE');
                                                    setIsLessonModalOpen(true);
                                                }}
                                                title={t('add_lesson_for_teacher')}
                                            >
                                                <Plus size={16}/>
                                                <span>{t('add_lesson_btn')}</span>
                                            </button>
                                        </div>

                                        <div className="adminTeacherGroupLessons">
                                            {teacherPractices.length === 0 ? (
                                                <p className="adminTeacherGroupEmpty">{t('no_lessons_for_teacher')}</p>
                                            ) : (
                                                teacherPractices.map((les) => (
                                                    <div key={les.id} className="adminScheduleRow">
                                                        <div className="adminScheduleRowInfo">
                                                            {les.room && (
                                                                <span
                                                                    className="adminScheduleRoomBadge">{les.room}</span>
                                                            )}
                                                            <div className="adminScheduleTime">
                                                                {dayNames[les.dayOfWeek] ?? 'Pondelok'}
                                                                <span>{les.hour}:00 – {les.endHour ?? (les.hour + 2)}:00</span>
                                                            </div>
                                                        </div>
                                                        <div className="adminScheduleRowActions">
                                                            <button
                                                                type="button"
                                                                className="adminControlBtn adminControlBtn--edit"
                                                                onClick={() => {
                                                                    setEditingLessonForModal(les);
                                                                    setSelectedTeacherForLesson(teacher);
                                                                    setLessonModalDefaultType('PRACTICE');
                                                                    setIsLessonModalOpen(true);
                                                                }}
                                                                title={t('edit_lesson')}
                                                            >
                                                                <Edit2 size={16}/>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="adminControlBtn adminControlBtn--delete"
                                                                onClick={() => setLessonToDelete(les.id)}
                                                                title={t('delete_lesson')}
                                                            >
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </QueryState>
            </div>

            {/* MODAL: CREATE / EDIT LESSON */}
            {isLessonModalOpen && (
                <CreateLessonModal
                    isOpen={isLessonModalOpen}
                    onClose={() => {
                        setIsLessonModalOpen(false);
                        setSelectedTeacherForLesson(null);
                        setEditingLessonForModal(null);
                    }}
                    teacherId={selectedTeacherForLesson?.id}
                    teacherName={selectedTeacherForLesson?.name}
                    editingLesson={editingLessonForModal}
                    defaultType={lessonModalDefaultType}
                    hideTypeSelect={editingLessonForModal?.type?.toUpperCase() === 'LECTURE' || lessonModalDefaultType === 'LECTURE'}
                    onSuccess={() => {
                        refetchTeachers();
                        refetchLectures();
                    }}
                />
            )}

            <ConfirmModal
                isOpen={!!lessonToDelete}
                title={t('delete_lesson')}
                message={t('confirm_delete_lesson')}
                confirmText={t('delete_btn')}
                isDanger={true}
                loading={deleteLessonMutation.isPending}
                onConfirm={handleConfirmDeleteLesson}
                onCancel={() => setLessonToDelete(null)}
            />
        </>
    );
}

export default LessonsTab;