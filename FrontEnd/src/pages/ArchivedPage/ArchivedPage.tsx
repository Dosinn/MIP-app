import { useState } from 'react';
import './ArchivedPage.css';
import ProjectCardComponent from '../../components/ProjectCard/ProjectCard.tsx';
import QueryState from '../../components/QueryState/QueryState.tsx';
import { useTranslation } from 'react-i18next';
import { useMyArchivedProjects, useUnarchiveProject } from '../../hooks/useProjects.ts';
import { Archive, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast/ToastContext.tsx';
import type { ProjectCard } from '../../api/schemas/ProjectSchema.ts';
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal.tsx";

function ArchivedPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    const { data: projects = [], isPending, isError, refetch } = useMyArchivedProjects();
    const unarchiveMutation = useUnarchiveProject();

    const [projectToUnarchive, setProjectToUnarchive] = useState<ProjectCard | null>(null);

    const isTeacher = user?.role === 'teacher';
    const isAdmin = user?.role === 'admin';
    const canUnarchive = isTeacher || isAdmin;

    const handleConfirmUnarchive = async () => {
        if (!projectToUnarchive) return;
        try {
            await unarchiveMutation.mutateAsync(projectToUnarchive.id);
            showSuccess(t('project_unarchived_success'));
            setProjectToUnarchive(null);
            refetch();
        } catch {
            showError(t('unarchive_failed'));
        }
    };

    if (isPending || isError) {
        return (
            <QueryState
                isPending={isPending}
                isError={isError}
                onRetry={refetch}
                errorMessageKey="failed_to_load_project"
                size="page"
            />
        );
    }

    return (
        <div className="archivedPage">
            <div className="archivedPageHeader">
                <button
                    type="button"
                    className="archivedBackBtn"
                    onClick={() => navigate('/account')}
                    aria-label={t('back_btn_aria')}
                >
                    <ArrowLeft size={26} />
                </button>
                <div className="archivedTitleGroup">
                    <div className="archivedTitleWrapper">
                        <h1 className="sectionText">{t('archived_projects_title')}</h1>
                    </div>
                </div>
            </div>

            <div className="projectsContainerArchived">
                {projects.length === 0 ? (
                    <div className="emptyArchivedState">
                        <Archive size={40} className="emptyArchivedIcon" />
                        <p className="teacherEmptyState">{t('no_archived_projects_msg')}</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="archivedCardWrapper">
                            <ProjectCardComponent project={project} />
                            {canUnarchive && (
                                <div className="archivedCardActions">
                                    <button
                                        type="button"
                                        className="unarchiveActionBtn"
                                        onClick={() => setProjectToUnarchive(project)}
                                        title={t('unarchive_project_btn')}
                                    >
                                        <RefreshCw size={14} />
                                        <span>{t('unarchive_project_btn')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal for Unarchive confirmation */}
            {projectToUnarchive && (


                <ConfirmModal
                    isOpen={!!projectToUnarchive}
                    title={t('unarchive_confirm_title')}
                    message={t('unarchive_confirm_desc', {title: projectToUnarchive.title})}
                    confirmText={unarchiveMutation.isPending ? t('unarchiving_loader') : t('confirm_unarchive_btn')}
                    isDanger={true}
                    loading={unarchiveMutation.isPending }
                    onConfirm={handleConfirmUnarchive}
                    onCancel={() => setProjectToUnarchive(null)}
                />

            )}
        </div>
    );
}

export default ArchivedPage;
