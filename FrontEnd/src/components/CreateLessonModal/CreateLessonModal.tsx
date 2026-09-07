import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal/Modal.tsx';
import type { Teacher } from "../../api/schemas/PeopleSchema.ts";
import { useCreateLesson, useUpdateLesson } from '../../hooks/useLessons.ts';
import { useTeachers } from '../../hooks/useUsers.ts';
import {useToast} from '../Toast/ToastContext.tsx';
import { getApiErrorMessage } from '../../utils/errorHandler.ts';
import type { LessonResponse } from '../../api/schemas/PeopleSchema.ts';
import './CreateLessonModal.css';

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId?: number;
    teacherName?: string;
    editingLesson?: LessonResponse | null;
    hideTypeSelect?: boolean;
    defaultType?: 'PRACTICE' | 'LECTURE';
    onSuccess?: () => void;
}

const DAYS = [
    { value: 0, labelKey: 'day_monday', defaultLabel: 'Pondelok' },
    { value: 1, labelKey: 'day_tuesday', defaultLabel: 'Utorok' },
    { value: 2, labelKey: 'day_wednesday', defaultLabel: 'Streda' },
    { value: 3, labelKey: 'day_thursday', defaultLabel: 'Štvrtok' },
    { value: 4, labelKey: 'day_friday', defaultLabel: 'Piatok' },
];

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function CreateLessonModal({
    isOpen,
    onClose,
    teacherId,
    teacherName,
    editingLesson,
    defaultType,
    onSuccess,
}: CreateLessonModalProps) {
    const { t } = useTranslation();
    const { showSuccess, showError } = useToast();
    const createLessonMutation = useCreateLesson();
    const updateLessonMutation = useUpdateLesson();
    const { data: teachers = [] } = useTeachers();

    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const [dayOfWeek, setDayOfWeek] = useState<number>(0);
    const [hour, setHour] = useState<number>(8);
    const [endHour, setEndHour] = useState<number>(10);
    const [room, setRoom] = useState<string>('');
    const [lessonType, setLessonType] = useState<'PRACTICE' | 'LECTURE'>(defaultType ?? 'PRACTICE');

    useEffect(() => {
        if (editingLesson) {
            setDayOfWeek(editingLesson.dayOfWeek);
            setHour(editingLesson.hour);
            setEndHour(editingLesson.endHour ?? (editingLesson.type?.toUpperCase() === 'LECTURE' ? editingLesson.hour + 3 : editingLesson.hour + 2));
            setRoom(editingLesson.room || '');
            setLessonType(editingLesson.type?.toUpperCase() === 'LECTURE' ? 'LECTURE' : 'PRACTICE');
            if (editingLesson.teacherId && teachers.length > 0) {
                const found = teachers.find((t) => t.id === editingLesson.teacherId);
                if (found) setSelectedTeacher(found);
            }
        } else {
            if (defaultType) {
                setLessonType(defaultType);
                setEndHour(defaultType === 'LECTURE' ? 11 : 10);
            }
            if (teacherId && teachers.length > 0) {
                const found = teachers.find((t) => t.id === teacherId);
                if (found) setSelectedTeacher(found);
            } else if (teacherName && !selectedTeacher) {
                const found = teachers.find((t) => t.name === teacherName);
                if (found) setSelectedTeacher(found);
            }
        }
    }, [editingLesson, teacherId, teacherName, teachers, defaultType, selectedTeacher]);

    if (!isOpen) return null;

    const isSubmitting = createLessonMutation.isPending || updateLessonMutation.isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!room.trim()) {
            showError(t('fill_all_fields'));
            return;
        }

        const finalTeacherId = selectedTeacher ? selectedTeacher.id : teacherId || editingLesson?.teacherId;

        try {
            if (editingLesson) {
                await updateLessonMutation.mutateAsync({
                    id: editingLesson.id,
                    payload: {
                        dayOfWeek,
                        hour,
                        endHour,
                        room: room.trim().toUpperCase(),
                        teacherId: finalTeacherId,
                        type: lessonType,
                    },
                });
                showSuccess(t('lesson_updated_success'));
            } else {
                await createLessonMutation.mutateAsync({
                    dayOfWeek,
                    hour,
                    endHour,
                    room: room.trim().toUpperCase(),
                    teacherId: finalTeacherId,
                    type: lessonType,
                });
                showSuccess(
                    lessonType === 'LECTURE'
                        ? t('lecture_created_success')
                        : t('lesson_created_success')
                );
            }
            setRoom('');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    const modalTitle = editingLesson
        ? (lessonType === 'LECTURE'
            ? t('edit_lecture_title')
            : t('edit_lesson_title'))
        : (lessonType === 'LECTURE'
            ? t('add_lecture_title')
            : (selectedTeacher
                ? `${t('add_lesson_title')}: ${selectedTeacher.name}`
                : t('add_lesson_title')));

    const handleHourChange = (newHour: number) => {
        setHour(newHour);
        if (endHour <= newHour) {
            setEndHour(newHour + (lessonType === 'LECTURE' ? 3 : 2));
        }
    };

    return (
        <Modal
            title={modalTitle}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="createLessonForm">

                <div className="adminFormField">
                    <label className="adminFormLabel">{t('day_of_week_label')}</label>
                    <select
                        className="adminFormSelect"
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    >
                        {DAYS.map((d) => (
                            <option key={d.value} value={d.value}>
                                {t(d.labelKey)}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="adminFormField">
                        <label className="adminFormLabel">{t('hour_start_label')}</label>
                        <select
                            className="adminFormSelect"
                            value={hour}
                            onChange={(e) => handleHourChange(Number(e.target.value))}
                        >
                            {HOURS.map((h) => (
                                <option key={h} value={h}>
                                    {h}:00
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="adminFormField">
                        <label className="adminFormLabel">{t('hour_end_label')}</label>
                        <select
                            className="adminFormSelect"
                            value={endHour}
                            onChange={(e) => setEndHour(Number(e.target.value))}
                        >
                            {Array.from({ length: 22 - (hour + 1) + 1 }, (_, i) => hour + 1 + i).map((h) => (
                                <option key={h} value={h}>
                                    {h}:00
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="adminFormField">
                    <label className="adminFormLabel">{t('room_label')}</label>
                    <input
                        type="text"
                        className="adminFormInput"
                        placeholder="napr. 1.07 1.22"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        required
                    />
                </div>

                <div className="adminModalFooter">
                    <button type="button" className="adminCancelBtn" onClick={onClose}>
                        {t('cancel_btn_text')}
                    </button>
                    <button
                        type="submit"
                        className="adminSubmitBtn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? t('saving_btn_text')
                            : editingLesson
                            ? t('save_changes_btn_text')
                            : lessonType === 'LECTURE'
                            ? t('add_lecture_btn')
                            : t('add_lesson_btn')}
                    </button>
                </div>
            </form>

        </Modal>
    );
}

export default CreateLessonModal;
