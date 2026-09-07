import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import FileSection from './components/FileSection/FileSection';
import HistoryComponent from '../../components/HistoryComponent/HistoryComponent.tsx';
import QueryState from '../../components/QueryState/QueryState.tsx';

import './ManageProjectPage.css';
import filesRepository from '../../api/repositories/FilesRepository.ts';
import { useProjectDetail, useProjectHistory, useUpdateProject, useDeleteProject } from '../../hooks/useProjects.ts';
import {useToast} from '../../components/Toast/ToastContext.tsx';
import { getApiErrorMessage } from '../../utils/errorHandler.ts';

function ManageProjectPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { showSuccess, showError } = useToast();

    const { data: project, isPending: loadingProject, isError: projectError, refetch: refetchProject} = useProjectDetail(Number(id));

    const { data: comments, isPending: loadingComments, isError: commentsError} = useProjectHistory(Number(id));

    const updateProjectMutation = useUpdateProject();
    const deleteProjectMutation = useDeleteProject();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newFilesBySection, setNewFilesBySection] = useState<Record<string, File[]>>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description);
        }
    }, [project]);

    const updateNewFiles = (sectionName: string, files: File[]) => {
        setNewFilesBySection((prev) => ({ ...prev, [sectionName]: files }));
    };

    const removeExistingFile = async (_sectionName: string, fileId: number) => {
        try {
            await filesRepository.deleteFile(fileId);
            refetchProject();
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    const handleSave = async () => {
        if (!id) return;
        try {
            await updateProjectMutation.mutateAsync({
                id,
                data: { title: title.trim(), description: description.trim() },
            });

            const uploadPromises: Promise<unknown>[] = [];
            for (const [sectionName, files] of Object.entries(newFilesBySection)) {
                const section = project?.files.find((s) => s.sectionName === sectionName);
                const sectionId = section?.sectionId ?? 1;
                for (const file of files) {
                    uploadPromises.push(filesRepository.uploadFile(id, sectionId, file));
                }
            }
            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
                setNewFilesBySection({});
                refetchProject();
            }

            showSuccess(t('project_saved_success'));
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteProjectMutation.mutateAsync(id);
            navigate('/');
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    const isSaving = updateProjectMutation.isPending;

    if (loadingProject || projectError || !project) {
        return (
            <QueryState
                isPending={loadingProject}
                isError={projectError || !loadingProject}
                onRetry={refetchProject}
                errorMessageKey="failed_to_load_project"
                size="page"
            />
        );
    }

    return (
        <div className="managePage">
            <div className="manageHeader">
                <button className="backButtonManage" onClick={() => navigate(-1)}>
                    <ArrowLeft size={26} />
                </button>
                <h1 className="manageHeaderTitle">{t('manage_project_title')}</h1>
                <button className="deleteIconButton" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 size={24} />
                </button>
            </div>

            <div className="manageContent">
                <label className="fieldLabel">{t('project_name_text')}</label>
                <input
                    className="textInput"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                />

                <label className="fieldLabel">{t('project_desc_text')}</label>
                <textarea
                    className="textArea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    maxLength={1000}
                />

                <label className="fieldLabel">{t('manage_project_files_label')}</label>
                <div className="fileSectionsList">
                    {project.files.map((section) => (
                        <FileSection
                            key={section.sectionName}
                            section={section}
                            newFiles={newFilesBySection[section.sectionName] ?? []}
                            onNewFilesChange={(files) => updateNewFiles(section.sectionName, files)}
                            onRemoveExisting={(fileId) => removeExistingFile(section.sectionName, fileId)}
                        />
                    ))}
                </div>

                <label className="fieldLabel">{t('manage_project_comments_label')}</label>
                <QueryState
                    isPending={loadingComments}
                    isError={commentsError}
                    errorMessageKey="failed_to_load_comments"
                >
                    <HistoryComponent comments={comments} />
                </QueryState>

                <button className="saveButton" onClick={handleSave} disabled={isSaving}>
                    <Save size={18} />
                    {isSaving ? t('saving_btn_text') : t('save_changes_btn_text')}
                </button>
            </div>

            {showDeleteConfirm && (
                <div className="deleteOverlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="deleteModal" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('delete_project_modal_title')}</h3>
                        <p>{t('delete_project_modal_desc')}</p>
                        <div className="deleteModalActions">
                            <button className="cancelButton" onClick={() => setShowDeleteConfirm(false)}>
                                {t('cancel_btn_text')}
                            </button>
                            <button className="confirmDeleteButton" onClick={handleDelete}>
                                {t('delete_btn_text')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageProjectPage;