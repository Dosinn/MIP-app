import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {ArrowLeft, Clock, ChevronRight, Check, Send, X, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import './ProjectCreatePage.css';
import { useTeachers } from '../../hooks/useUsers';
import { useCreateProject, useProjectDetail } from '../../hooks/useProjects';
import { useToast } from '../../components/Toast/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatLesson } from '../../utils/formatDates';
import { getApiErrorMessage } from '../../utils/errorHandler';
import Modal from '../../components/Modal/Modal';
import QueryState from '../../components/QueryState/QueryState';
import type { Lesson } from '../../api/schemas/PeopleSchema';

import IdeaRadar, { type RadarData } from '../../components/IdeaRadar/IdeaRadar';
import AiTrustModal from "./components/AiTrustModal/AiTrustModal.tsx";
import {useProjectDraftAnalysis} from "../../hooks/useProjectDraftAnalysis.ts";

const MIN_TITLE_LENGTH = 3;
const MIN_DESC_LENGTH = 10;
const MIN_PROBLEM_LENGTH = 10;
const MIN_AUDIENCE_LENGTH = 8;
const MIN_UNIQUENESS_LENGTH = 8;
const DRAFT_STORAGE_KEY = 'project_create_draft';

const REAL_MIP_BASELINE: RadarData = {
    problemFocus: 76,
    nichePrecision: 72,
    alignment: 78,
    uniqueness: 70,
    evidence: 75,
};

export function calculateEvidenceScore(text: string): { score: number; hasMetrics: boolean; hasCitations: boolean } {
    const trimmed = (text || '').trim();
    if (!trimmed || trimmed.length < 10) return { score: 0, hasMetrics: false, hasCitations: false };

    let score = 0;
    const pctMatches = (trimmed.match(/\d+(?:[.,]\d+)?\s*(?:%|percent|percento|percentá|percentách)/gi) || []).length;
    const moneyMatches = (trimmed.match(/(?:[$€£]\s*\d+(?:[.,]\d+)*(?:\s*(?:k|m|b|tis|mil|mld|bil|billion))?|\d+(?:[\s.,]\d+)*\s*(?:€|eur|usd|\$|tis|mil|mld|bil|billion))/gi) || []).length;
    const kpiMatches = (trimmed.match(/\b(?:TRL\s*\d+|ESP32|DHT22|GPS|A\*|\d+\s*(?:h|hod|mes|rok|rokov|hours|months|years|staff|výskumníkov|riešiteľov))\b/gi) || []).length;
    const metricPts = Math.min(40, pctMatches * 15 + moneyMatches * 15 + kpiMatches * 10);
    score += metricPts;

    const techKeywords = /\b(?:analýz|model|senzor|dát|prototyp|algoritm|meran|experiment|pilot|valid|framework|hardware|prediction|scoring|výskum|vývoj)/gi;
    const techMatches = (trimmed.match(techKeywords) || []).length;
    const techPts = Math.min(30, techMatches * 8);
    score += techPts;

    const citKeywords = /\b(?:podľa|prieskum|štúdi|v porovnaní|benchmark|referenci|štatistik|vychádza z|ukazujú|case study|case-study|literat|actual)/gi;
    const citMatches = (trimmed.match(citKeywords) || []).length;
    const citPts = Math.min(20, citMatches * 10);
    score += citPts;

    const words = trimmed.split(/\s+/).length;
    const lengthPts = words >= 30 ? 10 : words >= 12 ? 5 : 0;
    score += lengthPts;

    return {
        score: Math.min(100, score),
        hasMetrics: metricPts > 0,
        hasCitations: citPts > 0,
    };
}

export function ProjectCreatePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { showSuccess, showError } = useToast();
    const { user } = useAuth();

    // 1. Improvement Mode
    const initialImprovingProject = location.state?.improvingProject as {
        id: number;
        title: string;
        description: string;
    } | undefined;

    const [improvingProject, setImprovingProject] = useState<{
        id: number;
        title: string;
        description: string;
    } | null>(initialImprovingProject || null);

    useEffect(() => {
        if (location.state?.improvingProject) {
            setImprovingProject(location.state.improvingProject);
        }
    }, [location.state]);


    // 2. Form Inputs
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [problem, setProblem] = useState('');
    const [audience, setAudience] = useState('');
    const [uniqueness, setUniqueness] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [showAiTrustModal, setShowAiTrustModal] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // hook
    const {
        similarProjects,
        problemAnalysis,
        audienceAnalysis,
        alignmentResult,
        categoryResult,
        uniquenessCompare,
        handleTitleDescBlur,
        handleProblemBlur,
        handleAudienceBlur,
        handleUniquenessBlur,
    } = useProjectDraftAnalysis({ title, description, problem, audience, uniqueness, improvingProject });


    // Queries & Mutations
    const { data: teachers = [], isPending: loadingTeachers, isError: teachersError, refetch: refetchTeachers } = useTeachers();
    const createProjectMutation = useCreateProject();
    const { data: baseProject } = useProjectDetail(improvingProject?.id ?? 0);

    const baselineRadarData: RadarData | null = useMemo(() => {
        if (!improvingProject) return null;

        if (baseProject) {
            const probFocus = baseProject.problemCohesion != null
                ? Math.round(baseProject.problemCohesion * 100)
                : REAL_MIP_BASELINE.problemFocus;

            const nichePrec = baseProject.audiencePrecision != null
                ? Math.round(baseProject.audiencePrecision * 100)
                : REAL_MIP_BASELINE.nichePrecision;

            const align = baseProject.alignmentScore != null
                ? Math.round(baseProject.alignmentScore * 100)
                : REAL_MIP_BASELINE.alignment;

            const uniq = baseProject.uniquenessScore != null
                ? Math.round(baseProject.uniquenessScore * 100)
                : REAL_MIP_BASELINE.uniqueness;

            const baseEvidence = calculateEvidenceScore(`${baseProject.problem || ''} ${baseProject.uniqueness || ''}`.trim());
            const ev = baseEvidence.score > 0 ? baseEvidence.score : REAL_MIP_BASELINE.evidence;

            return {
                problemFocus: probFocus,
                nichePrecision: nichePrec,
                alignment: align,
                uniqueness: uniq,
                evidence: ev,
            };
        }

        return REAL_MIP_BASELINE;
    }, [improvingProject, baseProject]);

    const topOverallSimilarity = uniquenessCompare?.candidates[0]?.overall_similarity ?? null;

    const MIDPOINT = 68;
    const STEEPNESS = 0.12;

    const calibratedUniqueness = useMemo(() => {
        if (problem.trim().length < MIN_PROBLEM_LENGTH || uniqueness.trim().length < MIN_UNIQUENESS_LENGTH) {
            return 0;
        }
        if (topOverallSimilarity === null) return 100;

        const score = 100 / (1 + Math.exp(STEEPNESS * (topOverallSimilarity - MIDPOINT)));
        return Math.round(score);
    }, [topOverallSimilarity, problem, uniqueness]);

    const lowestPrecisionSegment = audienceAnalysis.lowest_segment;

    const myTeacher = teachers.find((t) => t.id === user?.teacherId);
    const availableLessons: Lesson[] = useMemo(
        () => myTeacher?.lessons ?? (user?.teacherId ? [] : teachers.flatMap((t) => t.lessons ?? [])),
        [myTeacher, user?.teacherId, teachers]
    );

    const evidenceData = useMemo(() => {
        const fullEvidenceText = `${problem} ${uniqueness}`.trim();
        return calculateEvidenceScore(fullEvidenceText);
    }, [problem, uniqueness]);

    const radarData: RadarData = useMemo(() => {
        const probFocus = problemAnalysis.score !== null ? Math.round(problemAnalysis.score * 100) : 0;
        const nichePrec = audienceAnalysis.overall_precision !== null ? Math.round(audienceAnalysis.overall_precision * 100) : 0;
        const align = Math.round(alignmentResult.score * 100) ? Math.round(alignmentResult.score * 100) : 0;
        const uniq = calibratedUniqueness;
        const ev = evidenceData.score;

        return { problemFocus: probFocus, nichePrecision: nichePrec, alignment: align, uniqueness: uniq, evidence: ev };
    }, [problemAnalysis, audienceAnalysis, alignmentResult, calibratedUniqueness, evidenceData]);

    const isFormValid =
        title.trim().length >= MIN_TITLE_LENGTH &&
        description.trim().length >= MIN_DESC_LENGTH &&
        problem.trim().length >= MIN_PROBLEM_LENGTH &&
        audience.trim().length >= MIN_AUDIENCE_LENGTH &&
        uniqueness.trim().length >= MIN_UNIQUENESS_LENGTH &&
        selectedLesson !== null;

    useEffect(() => {
        const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                if (draft.title) setTitle(draft.title);
                if (draft.description) setDescription(draft.description);
                if (draft.problem) setProblem(draft.problem);
                if (draft.audience) setAudience(draft.audience);
                if (draft.uniqueness) setUniqueness(draft.uniqueness);
                if (draft.selectedCategory) setSelectedCategory(draft.selectedCategory);
                if (draft.improvingProject) setImprovingProject(draft.improvingProject);
                if (draft.selectedLesson) setSelectedLesson(draft.selectedLesson);
            } catch {
                /* empty */
            }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        sessionStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({ title, description, problem, audience, uniqueness, selectedCategory, improvingProject, selectedLesson })
        );
    }, [title, description, problem, audience, uniqueness, selectedCategory, improvingProject, selectedLesson, isHydrated]);

    useEffect(() => {
        if (!selectedLesson && availableLessons.length > 0) {
            setSelectedLesson(availableLessons[0]);
        }
    }, [availableLessons, selectedLesson]);

    const handleSubmitProject = useCallback(async () => {
        if (!isFormValid) {
            showError(t('create_project_validation_error'));
            return;
        }

        try {
            await createProjectMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                lessonId: selectedLesson ? selectedLesson.lessonId : 1,
                improvesProjectId: improvingProject?.id,
                problem: problem.trim() || undefined,
                targetAudience: audience.trim() || undefined,
                uniqueness: uniqueness.trim() || undefined,
                categoryId: selectedCategoryId ?? undefined,
                problemCohesion: problemAnalysis.score ?? undefined,
                audiencePrecision: audienceAnalysis.overall_precision ?? undefined,
                alignmentScore: alignmentResult.score,
                uniquenessScore: calibratedUniqueness / 100,
            });

            sessionStorage.removeItem(DRAFT_STORAGE_KEY);
            showSuccess(t('project_created_success'));
            navigate('/');
        } catch (err) {
            showError(getApiErrorMessage(err, 'create_project_submit_error'));
        }
    }, [isFormValid, title, description, problem, audience, uniqueness, selectedCategoryId, selectedLesson, improvingProject, createProjectMutation, navigate, showError, showSuccess, t, problemAnalysis, audienceAnalysis, alignmentResult, calibratedUniqueness]);

    const cohesionPct = problemAnalysis.score !== null ? Math.round(problemAnalysis.score * 100) : null;
    const precisionPct = audienceAnalysis.overall_precision !== null ? Math.round(audienceAnalysis.overall_precision * 100) : null;

    return (
        <div className="createProjectPage">
            <div className="createHeader">
                <button className="backButtonManage" onClick={() => navigate(-1)}>
                    <ArrowLeft size={26} />
                </button>
                <h1 className="manageHeaderTitle">
                    {improvingProject ? t('improve_project_title') : t('new_project_text')}
                </h1>
                <div className="headerSpacer" />
            </div>

            <div className="createContent">
                {improvingProject && (
                    <>
                        <label className="fieldLabel">{t('improving_project_label')}</label>
                        <div className="improveBanner">
                            <div className="improveBannerText" onClick={() => navigate(`/project/${improvingProject.id}`)}>
                                <span className="improveBannerTitle">{improvingProject.title}</span>
                            </div>
                            <button
                                type="button"
                                className="improveBannerClose"
                                onClick={() => setImprovingProject(null)}
                                aria-label={t('cancel_improve_aria')}
                            >
                                <X size={22} />
                            </button>
                        </div>
                    </>
                )}

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

                    {similarProjects.length > 0 && !improvingProject && (
                        <div className="similarProjectsInlineSection">
                            <div className="similarProjectsHeader">
                                <span className="similarProjectsHeaderTitle">
                                    {t('similar_projects_found_text')}
                                </span>
                            </div>

                            <div className="similarProjectsGrid">
                                {similarProjects.map((p) => (
                                    <div key={p.id} className="similarCardItem">
                                        <div className="similarCardTop">
                                            <span className="similarCardTitle">{p.title}</span>
                                            <span className="similarCardBadge">{Math.round(p.weighted_sim)}%</span>
                                        </div>
                                        <div className="similarCardBottom">
                                            <button
                                                type="button"
                                                className="similarCardImproveBtn"
                                                onClick={() => {
                                                    setImprovingProject({ id: p.id, title: p.title, description: p.description });
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    showSuccess(t('switched_to_improve_mode'));
                                                }}
                                            >
                                                <span>{t('improve_btn_text')}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="radarTopBarRow">
                    <button type="button" className="aiTrustTriggerBtn" onClick={() => setShowAiTrustModal(true)}>
                        <ShieldCheck size={15} />
                        <span>{t('ai_trust_btn_text')}</span>
                    </button>
                </div>

                <div className="createSectionBox">

                    <div className="createSectionHeader">
                        <h3 className="createSectionTitle">{t('details_spec_title')}</h3>
                    </div>

                    <div className="createField">

                        <div className="createFieldHeaderRow">
                            <label className="createLabel">
                                {t('problem_label')}
                                <span className="requiredStar">*</span>
                            </label>
                            {cohesionPct !== null && (
                                <span className={`statPill ${cohesionPct >= 70 ? 'statPill--green' : cohesionPct >= 55 ? 'statPill--yellow' : 'statPill--red'}`}>
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
                                            <span className="outlierTextSpan"> "{problemAnalysis.outlier.sentence}"</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="createField">
                        <div className="createFieldHeaderRow">
                            <label className="createLabel">
                                {t('audience_label')}
                                <span className="requiredStar">*</span>
                            </label>
                            <div className="audiencePillsInline">
                                {precisionPct !== null && (
                                    <span className={`statPill ${precisionPct >= 60 ? 'statPill--green' : precisionPct >= 45 ? 'statPill--yellow' : 'statPill--red'}`}>
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
                                        {t('least_specific_group_label')} <strong>«{lowestPrecisionSegment.label}»</strong> ({Math.round((lowestPrecisionSegment.precision ?? 0) * 100)}%)
                                        <br />
                                        <span className="audienceWarningHint">
                                            {t('audience_broad_nudge')}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

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

                    {categoryResult.tags.length > 0 && (
                        <>
                        <label className="createLabel">
                            {t('domain_classification_title')}
                        </label>
                        <div className="zeroShotSection">

                            <div className="domainPillsGrid">
                                {categoryResult.tags.map((d) => {
                                    const isSelected = selectedCategory === d.label;
                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            className={`domainPillBtn ${isSelected ? 'domainPillBtn--selected' : ''}`}
                                            onClick={() => {
                                                setSelectedCategoryId(d.id);
                                                setSelectedCategory(isSelected ? null : d.label);
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

                    {/* Real project baseline radar when improving, with calibrated MIP fallback */}
                    <IdeaRadar
                        current={radarData}
                        baseline={baselineRadarData}
                        currentLabel={title || t('your_project_label')}
                        baselineLabel={improvingProject?.title || t('baseline_project_label')}
                    />
                </div>

                <div className="createSectionBox">
                    <div className="createSectionHeader">
                        <h3 className="createSectionTitle">
                            {t('lesson_select_section')}
                            <span className="requiredStar">*</span>
                        </h3>
                    </div>

                    <QueryState isPending={loadingTeachers} isError={teachersError} onRetry={refetchTeachers} errorMessageKey="failed_to_load_teacher">
                        <button type="button" className="lessonSelectCardBtn" onClick={() => setShowLessonModal(true)}>
                            <div className="lessonSelectLeft">
                                <div className="lessonSelectIcon">
                                    <Clock size={22} />
                                </div>
                                <div className="lessonSelectInfo">
                                    <span className="lessonSelectMainText">
                                        {selectedLesson ? formatLesson(selectedLesson.dayOfWeek, selectedLesson.hour) : t('choose_lesson_placeholder')}
                                    </span>
                                    {myTeacher && (
                                        <span className="lessonSelectSubText">
                                            {t('teacher_label')}: {myTeacher.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight size={18} className="lessonSelectArrow" />
                        </button>
                    </QueryState>
                </div>

                <div className="newCreateBottomBar">
                    <div className="bottomBarInner">
                        <button type="button" className="newCreateSubmitBtn" onClick={handleSubmitProject} disabled={!isFormValid || createProjectMutation.isPending}>
                            {createProjectMutation.isPending ? (
                                <>
                                    <span className="submitSpinner" />
                                    <span>{t('creating_btn_text')}</span>
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>{improvingProject ? t('create_improvement_btn') : t('create_new_project_btn_text')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showLessonModal && (
                <Modal title={t('choose_lesson_title')} onClose={() => setShowLessonModal(false)}>
                    <div className="lessonChoseModal">
                        {availableLessons.map((lesson) => {
                            const isSelected = selectedLesson?.lessonId === lesson.lessonId;
                            return (
                                <button
                                    key={lesson.lessonId}
                                    type="button"
                                    className={`lessonOption ${isSelected ? 'lessonOption--selected' : ''}`}
                                    onClick={() => {
                                        setSelectedLesson(lesson);
                                        setShowLessonModal(false);
                                    }}
                                >
                                    <div className="lessonIconWrapper">
                                        <Clock size={22} strokeWidth={2} />
                                    </div>
                                    <div className="lessonOptionText">
                                        <span className="lessonLabel">{formatLesson(lesson.dayOfWeek, lesson.hour)}</span>
                                        {lesson.room && <span className="lessonRoomBadge">{lesson.room}</span>}
                                    </div>
                                    {isSelected && <Check size={16} className="lessonCheck" />}
                                </button>
                            );
                        })}
                    </div>
                </Modal>
            )}

            <AiTrustModal isOpen={showAiTrustModal} onClose={() => setShowAiTrustModal(false)} />
        </div>
    );
}

export default ProjectCreatePage;