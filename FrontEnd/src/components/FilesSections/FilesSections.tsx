import { FileText, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './FilesSections.css';
import type {ProjectFiles} from "../../api/schemas/FilesSchema.ts";

interface FilesSectionsProps {
    sections: ProjectFiles[];
}

function isPdf(name: string): boolean {
    return name.toLowerCase().endsWith('.pdf');
}

function FilesSections({ sections }: FilesSectionsProps) {
    const { t } = useTranslation();
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
                                <a
                                    key={file.id}
                                    href={file.fileUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="filesListItem"
                                >
                                    <div className={`filesListIcon ${isPdf(file.fileName) ? 'iconPdf' : 'iconOther'}`}>
                                        <FileText size={22} />
                                    </div>
                                    <span className="filesListName">{file.fileName}</span>
                                    <Download size={18} className="filesListDownload" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default FilesSections;