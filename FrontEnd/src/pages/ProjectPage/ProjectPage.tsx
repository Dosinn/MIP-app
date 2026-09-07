import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {ArrowLeft, Bookmark, Star, FileText, ChevronRight} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useState } from "react";

import './ProjectPage.css';
import formatName from "../../utils/formatName.ts";
import ProjectCardComponent from "../../components/ProjectCard/ProjectCard.tsx";
import Modal from "../../components/Modal/Modal.tsx";
import FilesSections from "../../components/FilesSections/FilesSections.tsx";
import QueryState from "../../components/QueryState/QueryState.tsx";
import { useProjectDetail, useProjectImprovements, useSavedProjectIds, useToggleSaveProject, useMyProject } from "../../hooks/useProjects.ts";
import { useAuth } from '../../context/AuthContext.tsx';
import UserAvatar from "../../components/UserAvatar/UserAvatar.tsx";
import IdeaFieldAccordion from "../../components/IdeaFieldAccordion/IdeaFieldAccordion.tsx";

function ProjectPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showFiles, setShowFiles] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);

    const fromReview = location.state?.fromReview === true;
    const isStudent = user?.role?.toLowerCase() === 'student';

    const { data: project, isPending: loadingProject, isError: projectError, refetch: refetchProject} = useProjectDetail(Number(id));

    const { data: savedIds = [] } = useSavedProjectIds();
    const toggleSaveMutation = useToggleSaveProject();
    const isSaved = project ? savedIds.includes(project.id) : false;

    const {data: improvements, isPending: loadingImprovements, isError: improvementsError} = useProjectImprovements(Number(id));

    const { data: myProject } = useMyProject();
    const alreadyHasProject = !!myProject;

    const showImproveButton = isStudent && !alreadyHasProject && !fromReview;

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

    const handleToggleBookmark = () => {
        if (!project) return;
        toggleSaveMutation.mutate({ projectId: project.id, isSaved });
    };

    const handleImprove = () => {
        navigate('/create-project', {
            state: {
                improvingProject: {
                    id: project.id,
                    title: project.title,
                    description: project.description,
                },
            },
        });
    };

    const firstMember = project.team?.members?.[0];
    const extraMembersCount = (project.team?.members?.length ?? 1) - 1;

    return (
        <div className="projectDetails">
            <div className="projectCover">
                <button className="backButton" onClick={() => navigate(-1)}>
                    <ArrowLeft size={32} />
                </button>
                <button
                    className={`bookmarkButton ${isSaved ? 'bookmarkButton--active' : ''}`}
                    onClick={handleToggleBookmark}
                    aria-label={isSaved ? t('unsave_project') : t('save_project')}
                >
                    <Bookmark
                        size={24}
                        fill={isSaved ? 'var(--color-primary-blue)' : 'none'}
                        stroke={isSaved ? 'var(--color-primary-blue)' : 'var(--color-slate-800)'}
                    />
                </button>
            </div>

            <div className="projectContent">
                <h2 className="projectTitle">{project.title}</h2>

                <div className="metaRow">
                    <div className="metaLeft" onClick={() => setShowTeamModal(true)}>
                        <UserAvatar name={firstMember?.name ?? ''} size={32} />
                        <span className="metaText">
                            {firstMember && (
                                <span className="metaTextName">
                                    {formatName(firstMember.name)} {extraMembersCount > 0 && `(+${extraMembersCount})`}
                                </span>
                            )}
                            {' • ' + (project.team?.year)}
                        </span>
                    </div>
                    <div className="metaRight">

                        {project.rating && (
                            <div className="ratingBadge">
                                <Star
                                    width={18}
                                    height={18}
                                    style={{marginRight: '6px'}}
                                    fill="#facc15"
                                    stroke="#facc15"
                                />
                                <span>{project.rating ?? '-'}</span>
                            </div>
                        )}

                    </div>
                </div>

                <h3 className="sectionTitleProject">Description</h3>

                <p className="projectDescription">{project.description}</p>

                <h3 className="sectionTitleProject">Idea breakdown</h3>

                <IdeaFieldAccordion
                    label="Riešený problém"
                    score={project.problemCohesion}
                    text={project.problem}
                />
                <IdeaFieldAccordion
                    label="Cieľová skupina"
                    score={project.audiencePrecision}
                    text={project.targetAudience}
                />
                <IdeaFieldAccordion
                    label="Unikátnosť"
                    score={project.uniquenessScore}
                    text={project.uniqueness}
                />

                {/*<div className="radarCardWrapper">*/}
                {/*    <RadarChart data={project.dnaRadar} />*/}
                {/*</div>*/}

                <button className="filesButton" onClick={() => setShowFiles(true)}>
                    <FileText size={22} />
                    <span>{t('show_files_text')} ({project.files.length})</span>
                    <ChevronRight size={18} className="filesButtonChevron" />
                </button>

                {showImproveButton && (
                    <button className="improveButton" onClick={handleImprove}>
                        {t('improve_btn_text')}
                    </button>
                )}

                {project.improvedFrom && (
                    <>
                        <h3 className="sectionTitle">{t('improved_from_project_label')}</h3>
                        <div className="improvementsList">
                            <ProjectCardComponent project={project.improvedFrom} />
                        </div>
                    </>
                )}

                {improvements && improvements.length > 0 && (
                    <>
                        <h3 className="sectionTitle">{t('improvements_text')}</h3>
                        <QueryState
                            isPending={loadingImprovements}
                            isError={improvementsError}
                            errorMessageKey="generic_error_text"
                        >
                            <div className="improvementsList">
                                {improvements.map((item) => (
                                    <ProjectCardComponent key={item.id} project={item} />
                                ))}
                            </div>
                        </QueryState>
                    </>
                )}

            {showFiles && (
                <Modal title={t('all_files_text')} onClose={() => setShowFiles(false)}>
                    <FilesSections sections={project.files} />
                </Modal>
            )}

            {showTeamModal && (
                <Modal title={t('team_members_text')} onClose={() => setShowTeamModal(false)}>
                    {project.team?.members?.map((member) => (
                        <div key={member.id} className="personOption">
                            <UserAvatar name={member.name} size={48} />
                            <div className="personInfo">
                                <span className="personName">{member.name}</span>
                                <span className="personEmail">{member.email}</span>
                            </div>
                        </div>
                    ))}
                </Modal>
            )}
            </div>
        </div>
    );
}

export default ProjectPage;