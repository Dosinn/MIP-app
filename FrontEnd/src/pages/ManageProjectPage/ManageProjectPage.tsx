import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, Save, ShieldCheck} from 'lucide-react';
import {useTranslation} from 'react-i18next';

import FileSection from './components/FileSection/FileSection';
import HistoryComponent from '../../components/HistoryComponent/HistoryComponent.tsx';
import QueryState from '../../components/QueryState/QueryState.tsx';
import IdeaRadar, {type RadarData} from '../../components/IdeaRadar/IdeaRadar';
import AiTrustModal from '../ProjectCreatePage/components/AiTrustModal/AiTrustModal.tsx';

import '../ProjectCreatePage/ProjectCreatePage.css';
import './ManageProjectPage.css';

import filesRepository from '../../api/repositories/FilesRepository.ts';
import similarityRepository from '../../api/repositories/SimilarityRepository.ts';
import {useProjectDetail, useProjectHistory, useUpdateProject} from '../../hooks/useProjects.ts';
import {useProjectDraftAnalysis} from '../../hooks/useProjectDraftAnalysis.ts';
import {useToast} from '../../components/Toast/ToastContext.tsx';
import {getApiErrorMessage} from '../../utils/errorHandler.ts';
import {calculateEvidenceScore} from '../ProjectCreatePage/ProjectCreatePage.tsx';

const MIN_TITLE_LENGTH = 3;
const MIN_DESC_LENGTH = 10;
const MIN_PROBLEM_LENGTH = 10;
const MIN_UNIQUENESS_LENGTH = 8;

export function ManageProjectPage() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {id} = useParams();
    const {showSuccess, showError} = useToast();

    const {
        data: project,
        isPending: loadingProject,
        isError: projectError,
        refetch: refetchProject
    } = useProjectDetail(Number(id));
    const {data: comments, isPending: loadingComments, isError: commentsError} = useProjectHistory(Number(id));

    const updateProjectMutation = useUpdateProject();

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [problem, setProblem] = useState('');
    const [audience, setAudience] = useState('');
    const [uniqueness, setUniqueness] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const [newFilesBySection, setNewFilesBySection] = useState<Record<string, File[]>>({});
    const [showAiTrustModal, setShowAiTrustModal] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Populate data from existing project
    useEffect(() => {
        if (project && !isHydrated) {
            setTitle(project.title);
            setDescription(project.description);
            setProblem(project.problem ?? '');
            setAudience(project.targetAudience ?? '');
            setUniqueness(project.uniqueness ?? '');
            setSelectedCategoryId(project.category?.id ?? null);
            setSelectedCategory(project.category?.name ?? null);
            setIsHydrated(true);
        }
    }, [project, isHydrated]);

    // NLP analysis hook (identical to ProjectCreatePage)
    const {
        problemAnalysis,
        audienceAnalysis,
        alignmentResult,
        categoryResult,
        uniquenessCompare,
        handleTitleDescBlur,
        handleProblemBlur,
        handleAudienceBlur,
        handleUniquenessBlur,
    } = useProjectDraftAnalysis({
        title,
        description,
        problem,
        audience,
        uniqueness,
        improvingProject: null,
    });

    const topOverallSimilarity = uniquenessCompare?.candidates[0]?.overall_similarity ?? null;

    const calibratedUniqueness = useMemo(() => {
        if (problem.trim().length < MIN_PROBLEM_LENGTH || uniqueness.trim().length < MIN_UNIQUENESS_LENGTH) {
            return 0;
        }
        if (topOverallSimilarity === null || topOverallSimilarity <= 45) return 100;
        if (topOverallSimilarity >= 95) return 0;
        return Math.round(100 - ((topOverallSimilarity - 45) / 50) * 100);
    }, [topOverallSimilarity, problem, uniqueness]);

    const evidenceData = useMemo(() => {
        const fullEvidenceText = `${problem} ${uniqueness}`.trim();
        return calculateEvidenceScore(fullEvidenceText);
    }, [problem, uniqueness]);

    // Live radar — reflects current edits, falling back to saved scores if re-analysis hasn't run
    const radarData: RadarData = useMemo(() => {
        const probFocus = problemAnalysis.score !== null
            ? Math.round(problemAnalysis.score * 100)
            : (project?.problemCohesion != null ? Math.round(project.problemCohesion * 100) : 0);

        const nichePrec = audienceAnalysis.overall_precision !== null
            ? Math.round(audienceAnalysis.overall_precision * 100)
            : (project?.audiencePrecision != null ? Math.round(project.audiencePrecision * 100) : 0);

        const align = alignmentResult.score !== 0.70 || !project?.alignmentScore
            ? (Math.round(alignmentResult.score * 100) || 0)
            : Math.round(project.alignmentScore * 100);

        const uniq = uniquenessCompare !== null
            ? calibratedUniqueness
            : (project?.uniquenessScore != null ? Math.round(project.uniquenessScore * 100) : calibratedUniqueness);

        const ev = evidenceData.score;
        return {problemFocus: probFocus, nichePrecision: nichePrec, alignment: align, uniqueness: uniq, evidence: ev};
    }, [problemAnalysis, audienceAnalysis, alignmentResult, calibratedUniqueness, evidenceData, project, uniquenessCompare]);

    // Baseline radar — the currently saved project scores in the database
    const baselineRadarData: RadarData | null = useMemo(() => {
        if (!project) return null;
        const baseEvidence = calculateEvidenceScore(`${project.problem || ''} ${project.uniqueness || ''}`.trim());
        return {
            problemFocus: project.problemCohesion != null ? Math.round(project.problemCohesion * 100) : 0,
            nichePrecision: project.audiencePrecision != null ? Math.round(project.audiencePrecision * 100) : 0,
            alignment: project.alignmentScore != null ? Math.round(project.alignmentScore * 100) : 0,
            uniqueness: project.uniquenessScore != null ? Math.round(project.uniquenessScore * 100) : 0,
            evidence: baseEvidence.score,
        };
    }, [project]);

    const cohesionPct = problemAnalysis.score !== null
        ? Math.round(problemAnalysis.score * 100)
        : (project?.problemCohesion != null ? Math.round(project.problemCohesion * 100) : null);

    const precisionPct = audienceAnalysis.overall_precision !== null
        ? Math.round(audienceAnalysis.overall_precision * 100)
        : (project?.audiencePrecision != null ? Math.round(project.audiencePrecision * 100) : null);

    const lowestPrecisionSegment = audienceAnalysis.lowest_segment;

    const isFormValid =
        title.trim().length >= MIN_TITLE_LENGTH &&
        description.trim().length >= MIN_DESC_LENGTH;

    const updateNewFiles = (sectionName: string, files: File[]) => {
        setNewFilesBySection((prev) => ({...prev, [sectionName]: files}));
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
        if (!isFormValid) {
            showError(t('create_project_validation_error'));
            return;
        }

        try {
            const resolvedProblemCohesion = problemAnalysis.score ?? project?.problemCohesion ?? undefined;
            const resolvedAudiencePrecision = audienceAnalysis.overall_precision ?? project?.audiencePrecision ?? undefined;
            const resolvedAlignmentScore = alignmentResult.score !== 0.70
                ? alignmentResult.score
                : (project?.alignmentScore ?? alignmentResult.score);
            const resolvedUniquenessScore = uniquenessCompare !== null
                ? calibratedUniqueness / 100
                : (project?.uniquenessScore ?? (calibratedUniqueness / 100));

            await updateProjectMutation.mutateAsync({
                id,
                data: {
                    title: title.trim(),
                    description: description.trim(),
                    problem: problem.trim() || undefined,
                    targetAudience: audience.trim() || undefined,
                    uniqueness: uniqueness.trim() || undefined,
                    categoryId: selectedCategoryId ?? undefined,
                    problemCohesion: resolvedProblemCohesion,
                    audiencePrecision: resolvedAudiencePrecision,
                    alignmentScore: resolvedAlignmentScore,
                    uniquenessScore: resolvedUniquenessScore,
                },
            });

            // Upload any newly selected files
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

            if (project?.status === 'approved') {
                await similarityRepository.createEmbeddings(id);
            }

            showSuccess(t('project_saved_success'));
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
        <div className="createProjectPage">
            {/* Header */}
            <div className="createHeader">
                <button className="backButtonManage" onClick={() => navigate(-1)} type="button">
                    <ArrowLeft size={26}/>
                </button>
                <h1 className="manageHeaderTitle">{t('manage_project_title')}</h1>
                <div className="headerSpacer"></div>
            </div>

            <div className="createContent">
                {/* Improved From Banner (if project extends an earlier work) */}
                {project.improvedFrom && (
                    <>
                        <label className="fieldLabel">{t('improving_project_label')}</label>
                        <div className="improveBanner">
                            <div
                                className="improveBannerText"
                                onClick={() => navigate(`/project/${project.improvedFrom?.id}`)}
                                style={{cursor: 'pointer'}}
                            >
                                <span
                                    className="improveBannerLabel">{t('improves_label') || 'Vychádza z projektu'}</span>
                                <span className="improveBannerTitle">{project.improvedFrom.title}</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Section 1: Basic info */}
                <div className="createSectionBox">
                    <div className="createSectionHeader">
                        <h3 className="createSectionTitle">{t('basic_info_title')}</h3>
                    </div>

                    <div className="createField">
                        <label className="createLabel">
                            {t('project_name_text')}
                            <span className="requiredStar">*</span>
                        </label>
                        <input
                            type="text"
                            className="createInput"
                            placeholder={t('project_name_placeholder')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleDescBlur}
                        />
                    </div>

                    <div className="createField">
                        <label className="createLabel">
                            {t('project_desc_text')}
                            <span className="requiredStar">*</span>
                        </label>
                        <textarea
                            className="createTextarea"
                            placeholder={t('project_desc_placeholder')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleTitleDescBlur}
                            rows={5}
                            maxLength={1000}
                        />
                    </div>
                </div>

                {/* AI Trust Trigger */}
                <div className="radarTopBarRow">
                    <button type="button" className="aiTrustTriggerBtn" onClick={() => setShowAiTrustModal(true)}>
                        <ShieldCheck size={15}/>
                        <span>{t('ai_trust_btn_text')}</span>
                    </button>
                </div>

                {/* Section 2: Details / NLM Analysis */}
                <div className="createSectionBox">
                    <div className="createSectionHeader">
                        <h3 className="createSectionTitle">{t('details_spec_title')}</h3>
                    </div>

                    {/* Problem */}
                    <div className="createField">
                        <div className="createFieldHeaderRow">
                            <label className="createLabel">
                                {t('problem_label')}
                                <span className="requiredStar">*</span>
                            </label>
                            {cohesionPct !== null && (
                                <span
                                    className={`statPill ${cohesionPct >= 70 ? 'statPill--green' : cohesionPct >= 55 ? 'statPill--yellow' : 'statPill--red'}`}>
                                    {cohesionPct}% {t('focus_label')}
                                </span>
                            )}
                        </div>

                        <textarea
                            className="createTextarea"
                            placeholder={t('problem_placeholder')}
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            onBlur={handleProblemBlur}
                            rows={5}
                        />

                        {problem.trim().length > 10 && (
                            <div className="fieldInsightsRow">
                                {evidenceData.score < 40 ? (
                                    <div className="evidenceNudgeBox">
                                        <span>{t('evidence_tip_text')}</span>
                                    </div>
                                ) : (
                                    <div className="evidenceSuccessBox">
                                        <span>{t('evidence_success_text')} ({evidenceData.score}%)</span>
                                    </div>
                                )}

                                {problemAnalysis.outlier && (
                                    <div className="outlierAlertDirect">
                                        <div className="outlierAlertBody">
                                            <strong>{t('outlier_warning_prefix')}</strong>
                                            <span
                                                className="outlierTextSpan"> "{problemAnalysis.outlier.sentence}"</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Audience */}
                    <div className="createField">
                        <div className="createFieldHeaderRow">
                            <label className="createLabel">
                                {t('audience_label')}
                                <span className="requiredStar">*</span>
                            </label>
                            <div className="audiencePillsInline">
                                {precisionPct !== null && (
                                    <span
                                        className={`statPill ${precisionPct >= 60 ? 'statPill--green' : precisionPct >= 45 ? 'statPill--yellow' : 'statPill--red'}`}>
                                        {precisionPct}% {t('niche_label')}
                                    </span>
                                )}
                            </div>
                        </div>
                        <textarea
                            className="createTextarea"
                            placeholder={t('audience_placeholder')}
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            onBlur={handleAudienceBlur}
                            rows={5}
                        />

                        {lowestPrecisionSegment && (lowestPrecisionSegment.precision ?? 1) < 0.45 && (
                            <div className="outlierAlertDirect">
                                <div className="outlierAlertBody">
                                    <span className="audienceWarningTitle">
                                        {t('least_specific_group_label')}
                                        <strong>«{lowestPrecisionSegment.label}»</strong> ({Math.round((lowestPrecisionSegment.precision ?? 0) * 100)}%)
                                        <br/>
                                        <span className="audienceWarningHint">
                                            {t('audience_broad_nudge')}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Uniqueness */}
                    <div className="createField">
                        <div className="createFieldHeaderRow">
                            <label className="createLabel">
                                {t('uniqueness_label')}
                                <span className="requiredStar">*</span>
                            </label>
                            {!alignmentResult.is_aligned && problem.trim().length > 10 && uniqueness.trim().length > 10 && (
                                <span className="statPill statPill--yellow">{t('alignment_weak_pill')}</span>
                            )}
                        </div>

                        <textarea
                            className="createTextarea"
                            placeholder={t('uniqueness_placeholder')}
                            value={uniqueness}
                            onChange={(e) => setUniqueness(e.target.value)}
                            onBlur={handleUniquenessBlur}
                            rows={5}
                        />
                    </div>

                    {/* Category / Domain classification pills */}
                    {categoryResult.tags.length > 0 && (
                        <>
                            <label className="createLabel">
                                {t('domain_classification_title')}
                            </label>
                            <div className="zeroShotSection">
                                <div className="domainPillsGrid">
                                    {categoryResult.tags.map((d) => {
                                        const isSelected = selectedCategory === d.label || selectedCategoryId === d.id;
                                        return (
                                            <button
                                                key={d.id}
                                                type="button"
                                                className={`domainPillBtn ${isSelected ? 'domainPillBtn--selected' : ''}`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedCategoryId(null);
                                                        setSelectedCategory(null);
                                                    } else {
                                                        setSelectedCategoryId(d.id);
                                                        setSelectedCategory(d.label);
                                                    }
                                                }}
                                            >
                                                <span>{d.label}</span>
                                                <span className="domainPctBadge">{Math.round(d.score * 100)}%</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Section 3: Files */}
                {project.files && project.files.length > 0 && (
                    <div className="createSectionBox">
                        <div className="createSectionHeader">
                            <h3 className="createSectionTitle">{t('manage_project_files_label')}</h3>
                        </div>
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
                    </div>
                )}

                {/* Section 4: IdeaRadar — comparing live edits against database baseline */}
                <div className="createSectionBox">
                    <IdeaRadar
                        current={radarData}
                        baseline={baselineRadarData}
                        currentLabel={title || t('your_project_label')}
                        baselineLabel={t('saved_version_label')}
                    />
                </div>

                {/* Section 4: History / Comments */}
                {comments && comments.length > 0 && (
                    <div className="createSectionBox">
                        <div className="createSectionHeader">
                            <h3 className="createSectionTitle">{t('manage_project_comments_label')}</h3>
                        </div>
                        <QueryState isPending={loadingComments} isError={commentsError}
                                    errorMessageKey="failed_to_load_comments">
                            <HistoryComponent comments={comments}/>
                        </QueryState>
                    </div>
                )}

                {/* Bottom Submit Bar (identical to ProjectCreatePage) */}
                <div className="newCreateBottomBar">
                    <div className="bottomBarInner">
                        <button
                            type="button"
                            className="newCreateSubmitBtn"
                            onClick={handleSave}
                            disabled={!isFormValid || isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span className="submitSpinner"/>
                                    <span>{t('saving_btn_text')}</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18}/>
                                    <span>{t('save_changes_btn_text')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Trust Transparency Modal */}
            <AiTrustModal isOpen={showAiTrustModal} onClose={() => setShowAiTrustModal(false)}/>
        </div>
    );
}

export default ManageProjectPage;