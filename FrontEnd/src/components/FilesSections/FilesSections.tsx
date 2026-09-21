import { Eye, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './FilesSections.css';
import type { FileAttachment, ProjectFiles } from "../../api/schemas/FilesSchema.ts";

interface FilesSectionsProps {
    sections: ProjectFiles[];
}

function FilesSections({ sections }: FilesSectionsProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const openPreview = (file: FileAttachment) => {
        const viewUrl = file.viewUrl ?? file.fileUrl;
        const params = new URLSearchParams({
            url:      viewUrl,
            download: file.fileUrl,
            name:     file.fileName,
        });
        navigate(`/file-preview?${params.toString()}`);
    };

    return (
        <div className="fileReviewGroup">
            {sections.map((section) => (
                <div key={section.sectionName} className="filesGroupCard">
                    <div className="filesGroupCardHeader">
                        <span className="filesGroupCardTitle">{section.sectionName}</span>
                    </div>

                    {section.sectionFiles.length === 0 ? (
                        <p className="filesGroupCardEmpty">{t('no_files_text')}</p>
                    ) : (
                        <div className="filesList">
                            {section.sectionFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="filesListItem"
                                    onClick={() => openPreview(file)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && openPreview(file)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="filesListIcon iconPdf">
                                        <FileText size={22} />
                                    </div>
                                    <span className="filesListName">{file.fileName}</span>
                                    <div
                                        className="filesListDownloadBtn"
                                        style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', color: 'inherit' }}
                                    >
                                        <Eye size={18} className="filesListDownload" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default FilesSections;