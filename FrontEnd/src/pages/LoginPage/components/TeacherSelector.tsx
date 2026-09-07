import { useTranslation } from 'react-i18next';
import PersonPicker from '../../../components/PersonPicker/PersonPicker.tsx';
import type { Teacher, User } from '../../../api/schemas/PeopleSchema.ts';

export type { Teacher };

interface TeacherPickerProps {
    teachers: Teacher[];
    selectedId: string | null;
    onSelect: (teacher: Teacher) => void;
    onClose: () => void;
}

function TeacherPicker({ teachers, selectedId, onSelect, onClose }: TeacherPickerProps) {
    const { t } = useTranslation();

    return (
        <PersonPicker
            title={t('select_teacher_title')}
            searchPlaceholder={t('search_teacher_placeholder')}
            emptyMessage={t('no_teacher_found_msg')}
            people={teachers as User[]}
            selectedIds={selectedId ? [selectedId] : []}
            onSelect={(person) => onSelect(person as Teacher)}
            onClose={onClose}
        />
    );
}

export default TeacherPicker;