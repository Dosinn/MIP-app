import {useNavigate, useParams} from 'react-router-dom';
import {Archive, ArrowLeft, Star} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";

import './TeacherProjectReview.css';
import DecisionModal from './components/DecisionModal/DecisionModal.tsx';
import type {HistoryElement, Project, SimilarityProject} from "../../api/schemas/ProjectSchema.ts";
import projectsRepository from "../../api/repositories/ProjectsRepository.ts";
import formatName from "../../utils/formatName.ts";
import FilesSections from "../../components/FilesSections/FilesSections.tsx";
import Modal from "../../components/Modal/Modal.tsx";
import HistoryComponent from "../../components/HistoryComponent/HistoryComponent.tsx";
import similarityRepository from "../../api/repositories/SimilarityRepository.ts";
import ProjectCardComponent from "../../components/ProjectCard/ProjectCard.tsx";
import QueryState from "../../components/QueryState/QueryState.tsx";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal.tsx";
import {useApproveProject, useArchiveProject, useReturnProject, useUnarchiveProject} from "../../hooks/useProjects.ts";
import {useToast} from "../../components/Toast/ToastContext.tsx";
import ProjectDiffViewer from './components/ProjectDiffViewer/ProjectDiffViewer.tsx';
import getApiErrorMessage from "../../utils/errorHandler.ts";
import IdeaFieldAccordion from "../../components/IdeaFieldAccordion/IdeaFieldAccordion.tsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.tsx";

function TeacherProjectReview() {
    const navigate = useNavigate();
    const {id} = useParams();
    const {t} = useTranslation();
    const {showSuccess, showError} = useToast();

    const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

    const approveMutation = useApproveProject();
    const returnMutation = useReturnProject();
    const archiveMutation = useArchiveProject();
    const unarchiveMutation = useUnarchiveProject();

    const isSubmitting = approveMutation.isPending || returnMutation.isPending || archiveMutation.isPending || unarchiveMutation.isPending;

    const {
        data: project,
        isPending: loadingProject,
        isError: projectError,
        refetch: refetchProject,
    } = useQuery<Project>({
        queryKey: ['project', id],
        queryFn: () => {
            if (!id) {
                throw new Error('Project id is required');
            }
            return projectsRepository.getProjectById(Number(id));
        },
        enabled: !!id,
    });

    const {
        data: similarityProjects,
        isPending: loadingSimilarity,
        isError: similarityError,
    } = useQuery<SimilarityProject[]>({
        queryKey: ['similarityProjects', project?.id],
        queryFn: () => {
            if (!project) {
                throw new Error('Project data is required');
            }
            return similarityRepository.getSimilarityProjectByTitleAndDescription(
                project.title,
                project.description
            );
        },
        enabled: !!project?.title && !!project?.description,
    });

    const [viewMode, setViewMode] = useState<'current' | 'diff'>('current');

    const {
        data: comments,
        isPending: loadingCommentsData,
        isError: commentsError,
    } = useQuery<HistoryElement[]>({
        queryKey: ['comments', id],
        queryFn: () => {
            if (!id) {
                throw new Error('Project id is required');
            }
            return projectsRepository.getHistoryElementsByProjectId(Number(id));
        },
        enabled: !!id,
    });

    const lastReturnedHistory = useMemo(
        () => comments?.find((c) => c.status === 'returned_by_teacher'),
        [comments]
    );

    const handleConfirmDecision = async (reason: string) => {
        if (!pendingDecision || !id) return;

        try {
            if (pendingDecision === 'approved') {
                await approveMutation.mutateAsync({projectId: id, message: reason});
                if (project) {
                    await similarityRepository.createEmbeddings(project.id)
                }
            } else {
                await returnMutation.mutateAsync({projectId: id, message: reason});
            }
            showSuccess(t('decision_submitted_success'));
            setPendingDecision(null);
            navigate(-1);
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };


    const handleArchiveToggle = async () => {
        if (!project) return;
        try {
            if (project.archived) {
                await unarchiveMutation.mutateAsync(project.id);
                showSuccess(t('project_unarchived_success'));
                refetchProject();
            } else {
                setShowArchiveConfirm(true);
            }
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

    const handleConfirmArchive = async () => {
        if (!project) return;
        try {
            await archiveMutation.mutateAsync(project.id);
            showSuccess(t('project_archived_success'));
            setShowArchiveConfirm(false);
            refetchProject();
        } catch (err) {
            showError(getApiErrorMessage(err));
        }
    };

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

    const firstMember = project.team?.members?.[0];
    const extraMembersCount = (project.team?.members?.length ?? 1) - 1;

    return (
        <div className="projectDetails">
            <div className="projectCover">
                <button className="backButton" onClick={() => navigate(-1)}>
                    <ArrowLeft size={32}/>
                </button>
            </div>

            <div className="projectContent">
                <h2 className="projectTitle">{project.title}</h2>

                <div className="metaRow">
                    <div className="metaLeft" onClick={() => setShowTeamModal(true)}>
                        <UserAvatar name={firstMember?.name ?? ''} size={32}/>

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
                        <button
                            type="button"
                            className={`archiveBtnReview ${project.archived ? 'archiveBtnReview--archived' : ''}`}
                            onClick={handleArchiveToggle}
                            disabled={isSubmitting}
                            title={project.archived ? t('unarchive_project_btn') : t('archive_project_btn')}
                        >
                            <Archive size={15}/>
                            <span>{project.archived ? t('status_archived') : t('archive_btn')}</span>
                        </button>

                        {project.rating && (
                            <div className="ratingBadge">
                                <Star
                                    className="ratingBadgeStar"
                                    width={18}
                                    height={18}
                                    fill="#facc15"
                                    stroke="#facc15"
                                />
                                <span>{project.rating ?? '-'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {lastReturnedHistory && (
                    <div className="reviewTabNav">
                        <button
                            type="button"
                            className={`reviewTabBtn ${viewMode === 'current' ? 'reviewTabBtn--active' : ''}`}
                            onClick={() => setViewMode('current')}
                        >
                            <span>{t('view_current_version')}</span>
                        </button>
                        <button
                            type="button"
                            className={`reviewTabBtn ${viewMode === 'diff' ? 'reviewTabBtn--active' : ''}`}
                            onClick={() => setViewMode('diff')}
                        >
                            <span>{t('view_diff_changes')}</span>
                        </button>
                    </div>
                )}

                {viewMode === 'diff' && lastReturnedHistory ? (
                    <ProjectDiffViewer
                        currentText={project.description}
                        previousText={lastReturnedHistory.descriptionSnapshot}
                        lastReturnedHistory={lastReturnedHistory}
                    />
                ) : (
                    <>
                        <h3 className="sectionTitleProject">Description</h3>

                        <p className="projectDescription">{project.description}</p>
                    </>

                )}

                {project.improvedFrom && (
                    <div className="improvedFromSection">
                        <p className="fieldLabel labelReview" style={{marginTop: 0, marginBottom: '6px'}}>
                            {t('improved_from_project_label')}
                        </p>
                        <ProjectCardComponent
                            project={project.improvedFrom}
                            onClick={() => navigate(`/project/${project.improvedFrom!.id}`, {state: {fromReview: true}})}
                        />
                    </div>
                )}

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

                <h3 className="sectionTitleProject">Files</h3>

                <FilesSections sections={project.files}/>


                <QueryState
                    isPending={loadingSimilarity}
                    isError={similarityError}
                    errorMessageKey="failed_to_load_similar_projects"
                >
                    {similarityProjects && similarityProjects.length > 0 && (
                        <p className="fieldLabel labelReview">{t('similar_projects_found_text')}</p>
                    )}


                    <div className="similarityList">
                        {similarityProjects?.map((p) => (
                            <ProjectCardComponent
                                key={p.id}
                                project={p}
                                similarity={p.weighted_sim}
                                onClick={() => navigate(`/project/${p.id}`, {state: {fromReview: true}})}
                            />
                        ))}
                    </div>
                </QueryState>

                <label className="fieldLabel labelReview">{t('manage_project_comments_label')}</label>
                <QueryState
                    isPending={loadingCommentsData}
                    isError={commentsError}
                    errorMessageKey="failed_to_load_comments"
                >
                    <HistoryComponent comments={comments}/>
                </QueryState>

                {project.status === 'pending' && (
                    <div className="reviewActions">
                        <button className="rejectButton" onClick={() => setPendingDecision('rejected')}>
                            {t('reject_btn_text')}
                        </button>
                        <button className="approveButton" onClick={() => setPendingDecision('approved')}>
                            {t('approve_btn_text')}
                        </button>
                    </div>
                )}
            </div>

            {pendingDecision && (
                <DecisionModal
                    decision={pendingDecision}
                    onClose={() => setPendingDecision(null)}
                    onConfirm={handleConfirmDecision}
                    isSubmitting={isSubmitting}
                />
            )}

            {showTeamModal && (
                <Modal title={t('team_members_text')} onClose={() => setShowTeamModal(false)}>
                    {project.team?.members?.map((member) => (
                        <div key={member.id} className="personOption personOptionStatic">
                            <UserAvatar name={member.name} size={48}/>
                            <div className="personInfo">
                                <span className="personName">{member.name}</span>
                                <span className="personEmail">{member.email}</span>
                            </div>
                        </div>
                    ))}
                </Modal>
            )}

            <ConfirmModal
                isOpen={showArchiveConfirm}
                title={t('archive_project_btn')}
                message={t('confirm_archive_project')}
                confirmText={t('archive_btn')}
                isDanger={false}
                loading={archiveMutation.isPending}
                onConfirm={handleConfirmArchive}
                onCancel={() => setShowArchiveConfirm(false)}
            />
        </div>
    );
}

export default TeacherProjectReview;