import './SavedPage.css';
import ProjectCardComponent from '../../components/ProjectCard/ProjectCard.tsx';
import QueryState from '../../components/QueryState/QueryState.tsx';
import { useTranslation } from 'react-i18next';
import { useSavedProjects } from '../../hooks/useProjects.ts';
import {ArrowLeft} from "lucide-react";
import { useNavigate } from "react-router-dom";

function SavedPage() {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const { data: projects = [], isPending, isError, refetch } = useSavedProjects();

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
        <div className="savedPage">
            <div className="archivedPageHeader">
                <button
                    type="button"
                    className="archivedBackBtn"
                    onClick={() => navigate(-1)}
                    aria-label={t('back_btn_aria')}
                >
                    <ArrowLeft size={26} />
                </button>
                <div className="archivedTitleGroup">
                    <div className="archivedTitleWrapper">
                        <h1 className="sectionText">{t('account_saved_projects_text')}</h1>
                    </div>
                </div>
            </div>
            <div className="projectsContainerSaved">
                {projects.length === 0 ? (
                    <p className="teacherEmptyState">{t('no_projects_found_msg')}</p>
                ) : (
                    projects.map((project) => (
                        <ProjectCardComponent key={project.id} project={project} />
                    ))
                )}
            </div>
        </div>
    );
}

export default SavedPage;