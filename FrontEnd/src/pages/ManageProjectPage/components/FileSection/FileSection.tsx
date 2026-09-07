import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileUploader from '../FileUploader/FileUploader.tsx';
import './FileSection.css';
import type { ProjectFiles } from "../../../../api/schemas/FilesSchema.ts";

interface FileSectionProps {
    section: ProjectFiles;
    newFiles: File[];
    onNewFilesChange: (files: File[]) => void;
    onRemoveExisting: (fileId: number) => void;
}

function FileSection({ section, newFiles, onNewFilesChange, onRemoveExisting }: FileSectionProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const totalCount = section.sectionFiles.length + newFiles.length;

    const isLocked = section.locked;
    const now = new Date().getTime();
    const startsAt = section.startsAt ? new Date(section.startsAt).getTime() : null;
    const endsAt = section.endsAt ? new Date(section.endsAt).getTime() : null;

    let isClosed = false;
    let statusNotice = '';
    let badge = null;

    if (isLocked) {
        isClosed = true;
        statusNotice = t('section_locked_notice');
        badge = (
            <span className="sectionStatusBadge sectionStatusBadge--locked">
                {t('section_locked')}
            </span>
        );
    } else if (startsAt && now < startsAt) {
        isClosed = true;
        const dateStr = new Date(startsAt).toLocaleDateString('sk-SK');
        statusNotice = `${t('section_opens_on')} ${dateStr}`;
        badge = (
            <span className="sectionStatusBadge sectionStatusBadge--upcoming">
                {t('section_opens_short')} {dateStr}
            </span>
        );
    } else if (endsAt && now > endsAt) {
        isClosed = true;
        const dateStr = new Date(endsAt).toLocaleDateString('sk-SK');
        statusNotice = `${t('section_closed_on')} (${dateStr})`;
        badge = (
            <span className="sectionStatusBadge sectionStatusBadge--expired">
                {t('section_closed_short')}
            </span>
        );
    } else if (section.openForSubmission === false) {
        isClosed = true;
        statusNotice = t('section_not_open_notice');
        badge = (
            <span className="sectionStatusBadge sectionStatusBadge--locked">
                {t('section_locked')}
            </span>
        );
    } else {
        badge = (
            <span className="sectionStatusBadge sectionStatusBadge--open">
                {t('section_open')}
            </span>
        );
    }

    return (
        <div className="fileSection">
            <button type="button" className="fileSectionHeader" onClick={() => setIsOpen((prev) => !prev)}>
                <div className="fileSectionHeaderText">
                    <p className="fileSectionTitle">
                        {section.sectionName} {totalCount > 0 && `(${totalCount})`}
                    </p>
                    {badge}
                </div>
                <ChevronDown size={18} className={`fileSectionChevron ${isOpen ? 'fileSectionChevronOpen' : ''}`} />
            </button>

            {isOpen && (
                <div className="fileSectionBody">
                    {section.sectionDescription && <p className="fileSectionDescription">{section.sectionDescription}</p>}
                    <FileUploader
                        existingFiles={section.sectionFiles}
                        newFiles={newFiles}
                        onNewFilesChange={onNewFilesChange}
                        onRemoveExisting={onRemoveExisting}
                        disabled={isClosed}
                        disabledNotice={statusNotice}
                    />
                </div>
            )}
        </div>
    );
}

export default FileSection;