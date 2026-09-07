import { z } from 'zod';

export const SentenceDeviationSchema = z.object({
    sentence: z.string(),
    similarity_to_centroid: z.number(),
});

export const ProblemCohesionSchema = z.object({
    n_sentences: z.number(),
    score: z.number().nullable(),
    outlier: SentenceDeviationSchema.nullable(),
    per_sentence: z.array(SentenceDeviationSchema),
});
export type ProblemCohesionResult = z.infer<typeof ProblemCohesionSchema>;

export const AudienceSegmentSchema = z.object({
    label: z.string(),
    precision: z.number().nullable(),
});

export const AudienceAnalysisSchema = z.object({
    overall_precision: z.number().nullable(),
    lowest_segment: AudienceSegmentSchema.nullable(),
});
export type AudienceAnalysisResult = z.infer<typeof AudienceAnalysisSchema>;

export const CategoryTagSchema = z.object({
    id: z.number(),
    label: z.string(),
    score: z.number(),
    is_confident: z.boolean(),
});

export const CategoryClassifySchema = z.object({
    tags: z.array(CategoryTagSchema),
    top_category: z.string().nullable(),
    is_confident: z.boolean(),
});
export type CategoryClassifyResult = z.infer<typeof CategoryClassifySchema>;

export const AlignmentResultSchema = z.object({
    score: z.number(),
    is_aligned: z.boolean(),
    status: z.string(),
});
export type AlignmentResult = z.infer<typeof AlignmentResultSchema>;