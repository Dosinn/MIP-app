import {Edit2, Plus} from "lucide-react";
import QueryState from "../../../components/QueryState/QueryState.tsx";
import UserAvatar from "../../../components/UserAvatar/UserAvatar.tsx";
import Modal from "../../../components/Modal/Modal.tsx";
import {useState} from "react";
import type {Teacher} from "../../../api/schemas/PeopleSchema.ts";
import {useCreateTeacher, useUpdateUser} from "../../../hooks/useUsers.ts";
import {useToast} from "../../../components/Toast/ToastContext.tsx";
import {useTranslation} from "react-i18next";
import type {UseQueryResult} from "@tanstack/react-query";
import getApiErrorMessage from "../../../utils/errorHandler.ts";

interface TeachersTabProps {
    query: UseQueryResult<Teacher[]>;
}

export function TeachersTab({query}: TeachersTabProps) {
    const {t} = useTranslation();
    const {showSuccess, showError} = useToast();

    const {data: teachers = [], isPending: loadingTeachers, isError: teachersError, refetch: refetchTeachers} = query;

    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState(false);

    const [newTeacherName, setNewTeacherName] = useState('');
    const [newTeacherEmail, setNewTeacherEmail] = useState('');

    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [editTeacherName, setEditTeacherName] = useState('');
    const [editTeacherEmail, setEditTeacherEmail] = useState('');
    const [editTeacherRole, setEditTeacherRole] = useState<'TEACHER' | 'ADMIN'>('TEACHER');
    const [editTeacherIsTeaching, setEditTeacherIsTeaching] = useState(true);

    const createTeacherMutation = useCreateTeacher();
    const updateUserMutation = useUpdateUser();

    const handleCreateTeacher = async () => {
        if (!newTeacherName.trim() || !newTeacherEmail.trim()) {
            showError(t('fill_all_fields'));
            return;
        }

        try {
            await createTeacherMutation.mutateAsync({
                name: newTeacherName.trim(),
                email: newTeacherEmail.trim(),
            });
            showSuccess(t('teacher_created_success'));
            setNewTeacherName('');
            setNewTeacherEmail('');
            setIsTeacherModalOpen(false);
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    // Edit teacher handlers
    const openEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setEditTeacherName(teacher.name);
        setEditTeacherEmail(teacher.email || '');
        setEditTeacherRole(teacher.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'TEACHER');
        setEditTeacherIsTeaching(teacher.isTeacher ?? (teacher.role?.toUpperCase() === 'TEACHER'));
        setIsEditTeacherModalOpen(true);
    };

    const handleSaveTeacher = async () => {
        if (!editingTeacher) return;
        if (!editTeacherName.trim() || !editTeacherEmail.trim()) {
            showError(t('fill_all_fields'));
            return;
        }

        try {
            await updateUserMutation.mutateAsync({
                id: editingTeacher.id,
                data: {
                    name: editTeacherName.trim(),
                    email: editTeacherEmail.trim(),
                    role: editTeacherRole,
                    isTeacher: editTeacherRole === 'ADMIN' ? editTeacherIsTeaching : true,
                },
            });
            showSuccess(t('teacher_updated_success'));
            setIsEditTeacherModalOpen(false);
            setEditingTeacher(null);
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    return (
        <>
            <div className="adminTabContent">
                <div className="adminSectionActions">
                    <h2 className="adminSectionHeading">{t('manage_teachers_heading')}</h2>
                </div>
                <button type="button" className="adminAddBtn sectionBtn" onClick={() => setIsTeacherModalOpen(true)}>
                    <Plus size={18}/>
                    <span>{t('add_teacher_btn')}</span>
                </button>

                <QueryState
                    isPending={loadingTeachers}
                    isError={teachersError}
                    onRetry={refetchTeachers}
                    errorMessageKey="failed_to_load_teacher"
                >
                    <div className="adminUsersList">
                        {teachers.map((teacher) => {
                            return (
                                <div key={teacher.id} className="adminUserCard">
                                    <UserAvatar name={teacher.name} size={46}/>
                                    <div className="adminUserInfo">
                                        <div className="adminUserNameRow">
                                            <h3 className="adminUserName">{teacher.name}</h3>
                                        </div>
                                        <p className="adminUserEmail">{teacher.email}</p>
                                    </div>
                                    <div className="adminTeacherActions">
                                        <button
                                            type="button"
                                            className="adminControlBtn"
                                            onClick={() => openEditTeacher(teacher)}
                                            title={t('edit_teacher')}
                                        >
                                            <Edit2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </QueryState>
            </div>

            {/* MODAL: ADD TEACHER */}
            {isTeacherModalOpen && (
                <Modal
                    title={t('add_teacher_title')}
                    onClose={() => setIsTeacherModalOpen(false)}
                >
                    <div className="adminModalForm">
                        <label className="adminFieldLabel">{t('teacher_fullname_label')}</label>
                        <input
                            type="text"
                            className="adminModalInput"
                            placeholder="Ing. Ján Novák, PhD."
                            value={newTeacherName}
                            onChange={(e) => setNewTeacherName(e.target.value)}
                        />

                        <label className="adminFieldLabel">{t('teacher_email_label')}</label>
                        <input
                            type="email"
                            className="adminModalInput"
                            placeholder="jan.novak@uniza.sk"
                            value={newTeacherEmail}
                            onChange={(e) => setNewTeacherEmail(e.target.value)}
                        />

                        <div className="adminModalActions">
                            <button
                                type="button"
                                className="cancelButton"
                                onClick={() => setIsTeacherModalOpen(false)}
                            >
                                {t('cancel_btn_text')}
                            </button>
                            <button
                                type="button"
                                className="adminSaveBtn"
                                onClick={handleCreateTeacher}
                                disabled={createTeacherMutation.isPending}
                            >
                                {t('add_btn_text')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* MODAL: EDIT TEACHER */}
            {isEditTeacherModalOpen && editingTeacher && (
                <Modal
                    title={`${t('edit_teacher_title')}: ${editingTeacher.name}`}
                    onClose={() => {
                        setIsEditTeacherModalOpen(false);
                        setEditingTeacher(null);
                    }}
                >
                    <div className="adminModalForm">
                        <label className="adminFieldLabel">{t('teacher_fullname_label')}</label>
                        <input
                            type="text"
                            className="adminModalInput"
                            value={editTeacherName}
                            onChange={(e) => setEditTeacherName(e.target.value)}
                        />

                        <label className="adminFieldLabel">{t('teacher_email_label')}</label>
                        <input
                            type="email"
                            className="adminModalInput"
                            value={editTeacherEmail}
                            onChange={(e) => setEditTeacherEmail(e.target.value)}
                        />

                        <label className="adminFieldLabel">{t('user_role_label')}</label>
                        <select
                            className="adminModalInput adminModalSelect"
                            value={editTeacherRole}
                            onChange={(e) => setEditTeacherRole(e.target.value as 'TEACHER' | 'ADMIN')}
                        >
                            <option value="TEACHER">{t('role_teacher')}</option>
                            <option value="ADMIN">{t('role_admin')}</option>
                        </select>

                        {editTeacherRole === 'ADMIN' && (
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 500,
                                background: 'transparent'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={editTeacherIsTeaching}
                                    onChange={(e) => setEditTeacherIsTeaching(e.target.checked)}
                                    style={{width: '16px', height: '16px', cursor: 'pointer'}}
                                />
                                <span>{t('admin_can_teach_label')}</span>
                            </label>
                        )}

                        <div className="adminModalActions">
                            <button
                                type="button"
                                className="cancelButton"
                                onClick={() => {
                                    setIsEditTeacherModalOpen(false);
                                    setEditingTeacher(null);
                                }}
                            >
                                {t('cancel_btn_text')}
                            </button>
                            <button
                                type="button"
                                className="adminSaveBtn"
                                onClick={handleSaveTeacher}
                                disabled={updateUserMutation.isPending}
                            >
                                {t('save_btn_text')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default TeachersTab;