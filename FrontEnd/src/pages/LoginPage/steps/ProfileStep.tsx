import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import TeacherPicker, { type Teacher } from '../components/TeacherSelector';
import { useTranslation } from 'react-i18next';
import '../LoginFlow.css';
import { useTeachers } from '../../../hooks/useUsers.ts';
import UserAvatar from "../../../components/UserAvatar/UserAvatar.tsx";

interface ProfileStepProps {
    onSubmit: (name: string, teacherId: string) => Promise<void>;
}

function ProfileStep({ onSubmit }: ProfileStepProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: teachers = [] } = useTeachers();

    const isValid = name.trim().length > 0 && selectedTeacher !== null;

    const handleSubmit = async () => {
        if (!isValid || !selectedTeacher) {
            setError(t('profile_step_validation_error'));
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await onSubmit(name, String(selectedTeacher.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : t('general_error_msg'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="loginForm">
            <p className="stepTitle">{t('profile_step_title')}</p>
            <p className="stepSubtitle">{t('profile_step_subtitle')}</p>

            <input
                type="text"
                placeholder={t('profile_step_name_placeholder')}
                className="loginInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
            />

            <button type="button" className="teacherSelectButton" onClick={() => setShowPicker(true)}>
                {selectedTeacher ? (
                    <div className="teacherSelected">
                        <UserAvatar name={selectedTeacher.name} size={42} />
                        <span className="teacherSelectedInfo">
                            {selectedTeacher.name}<br />
                            <span className="teacherEmail">{selectedTeacher.email}</span>
                        </span>
                    </div>
                ) : (
                    <span className="teacherSelectPlaceholder">{t('profile_step_teacher_placeholder')}</span>
                )}
                <ChevronRight size={18} />
            </button>

            {error && <p className="errorText">{error}</p>}

            <button type="button" className="loginButton" onClick={handleSubmit} disabled={isLoading || !isValid}>
                {isLoading ? t('finishing_btn_text') : t('finish_btn_text')}
            </button>

            {showPicker && (
                <TeacherPicker
                    teachers={teachers}
                    selectedId={selectedTeacher ? String(selectedTeacher.id) : null}
                    onSelect={(teacher) => {
                        setSelectedTeacher(teacher);
                        setShowPicker(false);
                    }}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </div>
    );
}

export default ProfileStep;