import { useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './FileUploader.css';
import type {FileAttachment} from "../../../../api/schemas/FilesSchema.ts";

interface FileUploaderProps {
    existingFiles?: FileAttachment[];
    newFiles: File[];
    onNewFilesChange: (files: File[]) => void;
    onRemoveExisting?: (fileId: number) => void;
    disabled?: boolean;
    disabledNotice?: string;
}


const downloadNewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
};

function FileUploader({
    existingFiles = [],
    newFiles,
    onNewFilesChange,
    onRemoveExisting,
    disabled = false,
    disabledNotice,
}: FileUploaderProps) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (fileList: FileList | null) => {
        if (!fileList || disabled) return;
        onNewFilesChange([...newFiles, ...Array.from(fileList)]);
    };

    const removeNewFile = (index: number) => {
        if (disabled) return;
        onNewFilesChange(newFiles.filter((_, i) => i !== index));
    };

    const hasFiles = existingFiles.length > 0 || newFiles.length > 0;

    return (
        <div className="fileUploader">
            {disabled ? (
                <div className="dropZone dropZone--disabled">
                    <p className="dropZoneDisabledNotice">{disabledNotice || t('section_upload_disabled')}</p>
                </div>
            ) : (
                <div className="dropZone" onClick={() => inputRef.current?.click()}>
                    <Upload size={26} strokeWidth={1.8} />
                    <p>{t('add_files_btn')}</p>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={(e) => addFiles(e.target.files)}
                    />
                </div>
            )}

            {hasFiles && (
                <div className="fileList">
                    {existingFiles.map((file) => (
                        <div
                            key={`existing-${file.id}`}
                            className="fileItem"
                            onClick={() => window.open(file.fileUrl, '_blank', 'noopener,noreferrer')}
                        >
                            <FileText size={22} className="fileIcon" />
                            <span className="fileName">{file.fileName}</span>
                             {onRemoveExisting && (
                                <button
                                    type="button"
                                    className="removeFileButton"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveExisting(file.id); }}
                                >
                                <X size={18} />
                                </button>
                            )}
                        </div>
                    ))}

                    {newFiles.map((file, index) => (
                            <div
                                key={`new-${file.name}-${index}`}
                                className="fileItem"
                                onClick={() => downloadNewFile(file)}
                            >
                                <FileText size={22} className="fileIcon" />
                                <span className="fileName">{file.name}</span>
                                <button
                                    type="button"
                                    className="removeFileButton"
                                    onClick={(e) => { e.stopPropagation(); removeNewFile(index); }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                </div>
                )}
        </div>
    );
}

export default FileUploader;