import {useCallback, useRef, useState} from 'react';
import similarityRepository from '../api/repositories/SimilarityRepository';
import {useAnalyzeAlignment, useAnalyzeAudience, useAnalyzeProblem, useClassifyCategories} from './useNlp';
import {useCompareUniqueness} from './useSimilarity';
import type {SimilarityProject, UniquenessCompareResult} from '../api/schemas/ProjectSchema';
import type {
    AlignmentResult,
    AudienceAnalysisResult,
    CategoryClassifyResult,
    ProblemCohesionResult,
} from '../api/schemas/NlpSchema';

const MIN_TITLE_LENGTH = 3;
const MIN_DESC_LENGTH = 10;
const MIN_PROBLEM_LENGTH = 10;
const MIN_AUDIENCE_LENGTH = 8;
const SIMILARITY_DISPLAY_THRESHOLD = 52;

interface ImprovingProject {
    id: number;
    title: string;
    description: string;
}

interface UseProjectDraftAnalysisArgs {
    title: string;
    description: string;
    problem: string;
    audience: string;
    uniqueness: string;
    improvingProject: ImprovingProject | null;
}

const DEFAULT_PROBLEM_ANALYSIS: ProblemCohesionResult = {
    n_sentences: 0,
    score: null,
    outlier: null,
    per_sentence: [],
};

const DEFAULT_AUDIENCE_ANALYSIS: AudienceAnalysisResult = {
    overall_precision: null,
    lowest_segment: null,
};

const DEFAULT_ALIGNMENT_RESULT: AlignmentResult = {
    score: 0.70,
    is_aligned: true,
    status: 'aligned',
};

const DEFAULT_CATEGORY_RESULT: CategoryClassifyResult = {
    tags: [],
    top_category: null,
    is_confident: false,
};

export function useProjectDraftAnalysis({
                                            title,
                                            description,
                                            problem,
                                            audience,
                                            uniqueness,
                                            improvingProject
                                        }: UseProjectDraftAnalysisArgs) {

    const [similarProjects, setSimilarProjects] = useState<SimilarityProject[]>([]);

    const [problemAnalysis, setProblemAnalysis] = useState<ProblemCohesionResult>(DEFAULT_PROBLEM_ANALYSIS);
    const [audienceAnalysis, setAudienceAnalysis] = useState<AudienceAnalysisResult>(DEFAULT_AUDIENCE_ANALYSIS);
    const [alignmentResult, setAlignmentResult] = useState<AlignmentResult>(DEFAULT_ALIGNMENT_RESULT);
    const [categoryResult, setCategoryResult] = useState<CategoryClassifyResult>(DEFAULT_CATEGORY_RESULT);

    const [uniquenessCompare, setUniquenessCompare] = useState<UniquenessCompareResult | null>(null);

    const lastCheckedTitleDescRef = useRef<string>('');
    const lastCheckedProblemRef = useRef<string>('');
    const lastCheckedAudienceRef = useRef<string>('');
    const lastCheckedUniquenessRef = useRef<string>('');
    const lastCheckedCategoriesFullRef = useRef<string>('');
    const lastCheckedAlignmentRef = useRef<string>('');
    const lastCheckedCompareRef = useRef<string>('');

    const analyzeProblemMutation = useAnalyzeProblem();
    const analyzeAudienceMutation = useAnalyzeAudience();
    const analyzeAlignmentMutation = useAnalyzeAlignment();
    const classifyCategoriesMutation = useClassifyCategories();
    const compareUniquenessMutation = useCompareUniqueness();


    const triggerCategoriesCheck = useCallback(async () => {
        const full = `${title} ${description} ${problem} ${audience} ${uniqueness}`.trim();
        if (full.length < 15 || full === lastCheckedCategoriesFullRef.current) return;

        lastCheckedCategoriesFullRef.current = full;
        try {
            const res = await classifyCategoriesMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                topN: 4,
            });
            setCategoryResult(res);
        } catch {
            /* keep last known categories */
        }
    }, [title, description, problem, audience, uniqueness, classifyCategoriesMutation]);

    const triggerAlignmentCheck = useCallback(async () => {
        const probText = problem.trim();
        const solText = `${title}. ${description}. ${uniqueness}`.trim();
        const key = `${probText}|||${solText}`;

        if (probText.length < 10 || solText.length < 15 || key === lastCheckedAlignmentRef.current) return;

        lastCheckedAlignmentRef.current = key;
        try {
            const res = await analyzeAlignmentMutation.mutateAsync({problem: probText, solution: solText});
            setAlignmentResult(res);
        } catch {
            /* keep last known alignment */
        }
    }, [problem, title, description, uniqueness, analyzeAlignmentMutation]);

    const triggerUniquenessCompare = useCallback(async () => {
        const tTrim = title.trim();
        const dTrim = description.trim();
        const pTrim = problem.trim();
        const aTrim = audience.trim();
        const key = `${tTrim}|||${dTrim}|||${pTrim}|||${aTrim}|||${improvingProject?.id ?? ''}`;

        if (pTrim.length < MIN_PROBLEM_LENGTH || aTrim.length < MIN_AUDIENCE_LENGTH || key === lastCheckedCompareRef.current) {
            return;
        }
        lastCheckedCompareRef.current = key;

        try {
            const res = await compareUniquenessMutation.mutateAsync({
                title: tTrim,
                description: dTrim,
                problem: pTrim,
                target_audience: aTrim,
                improves_project_id: improvingProject?.id,
            });
            setUniquenessCompare(res);
        } catch {
            /* keep last known compare result */
        }
    }, [title, description, problem, audience, improvingProject, compareUniquenessMutation]);

    const handleTitleDescBlur = useCallback(async () => {
        const tTrim = title.trim();
        const dTrim = description.trim();
        const key = `${tTrim}|||${dTrim}`;

        if (tTrim.length >= MIN_TITLE_LENGTH && dTrim.length >= MIN_DESC_LENGTH && key !== lastCheckedTitleDescRef.current) {
            lastCheckedTitleDescRef.current = key;
            try {
                const res = await similarityRepository.getSimilarityProjectByTitleAndDescription(tTrim, dTrim);
                setSimilarProjects((res ?? []).filter((p) => p.weighted_sim >= SIMILARITY_DISPLAY_THRESHOLD).slice(0, 3));
            } catch {
                setSimilarProjects([]);
            }
        }

        triggerCategoriesCheck();
        triggerAlignmentCheck();
    }, [title, description, triggerCategoriesCheck, triggerAlignmentCheck]);

    const handleProblemBlur = useCallback(async () => {
        const pTrim = problem.trim();
        if (pTrim.length >= 8 && pTrim !== lastCheckedProblemRef.current) {
            lastCheckedProblemRef.current = pTrim;
            try {
                const res = await analyzeProblemMutation.mutateAsync(pTrim);
                setProblemAnalysis(res);
            } catch {
                /* keep last known problem analysis */
            }
        }

        triggerAlignmentCheck();
        triggerCategoriesCheck();
        triggerUniquenessCompare();
    }, [problem, analyzeProblemMutation, triggerAlignmentCheck, triggerCategoriesCheck, triggerUniquenessCompare]);

    const handleAudienceBlur = useCallback(async () => {
        const aTrim = audience.trim();
        if (aTrim.length >= 5 && aTrim !== lastCheckedAudienceRef.current) {
            lastCheckedAudienceRef.current = aTrim;
            try {
                const res = await analyzeAudienceMutation.mutateAsync(aTrim);
                setAudienceAnalysis(res);
            } catch {
                /* keep last known audience analysis */
            }
        }

        triggerCategoriesCheck();
        triggerUniquenessCompare();
    }, [audience, analyzeAudienceMutation, triggerCategoriesCheck, triggerUniquenessCompare]);

    const handleUniquenessBlur = useCallback(async () => {
        const uTrim = uniqueness.trim();
        if (uTrim !== lastCheckedUniquenessRef.current) {
            lastCheckedUniquenessRef.current = uTrim;
            triggerAlignmentCheck();
            triggerCategoriesCheck();
        }
    }, [uniqueness, triggerAlignmentCheck, triggerCategoriesCheck]);

    return {
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
    };
}