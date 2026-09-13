import { z } from "zod";
import { ProjectFilesSchema } from "./FilesSchema.ts";
import { TeamSchema, UserSchema } from "./PeopleSchema.ts";

export const ReviewStatusEnum = z.enum(['pending', 'approved', 'returned_by_teacher', 'returned']);

export const CommentStatusEnum = z.enum(['approved', 'returned_by_teacher', 'returned']);

export const CategorySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
});

export const ProjectMetricsSchema = z.object({
    problemCohesion: z.number().nullable().optional(),
    audiencePrecision: z.number().nullable().optional(),
    alignmentScore: z.number().nullable().optional(),
    uniquenessScore: z.number().nullable().optional(),
    hasContrastiveMarkers: z.boolean().optional().default(false),
});

export const ProjectCardSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    problem: z.string().optional().nullable(),
    targetAudience: z.string().optional().nullable(),
    uniqueness: z.string().optional().nullable(),
    team: TeamSchema.optional(),
    rating: z.number().nullable().optional(),
    status: z.string().optional(),
    archived: z.boolean().optional(),
    // NLP metrics
    problemCohesion: z.number().nullable().optional(),
    audiencePrecision: z.number().nullable().optional(),
    alignmentScore: z.number().nullable().optional(),
    uniquenessScore: z.number().nullable().optional(),
    hasContrastiveMarkers: z.boolean().optional().default(false),
    // Category
    category: CategorySchema.nullable().optional(),
});

export const ProjectSchema = ProjectCardSchema.extend({
    files: z.array(ProjectFilesSchema),
    improves: z.array(ProjectCardSchema).nullable().optional(),
    improvedFrom: ProjectCardSchema.nullable().optional(),
});

export const ProjectReviewSchema = ProjectCardSchema.extend({
    reviewStatus: z.string().default('pending'),
    lessonId: z.number().optional(),
    lessonDayOfWeek: z.number().optional(),
    lessonHour: z.number().optional(),
    lessonRoom: z.string().optional(),
    improvesProjectId: z.number().nullable().optional(),
    improvesProjectTitle: z.string().nullable().optional(),
});

export const HistoryElementSchema = z.object({
    id: z.number(),
    projectId: z.number().optional().nullable(),
    teacher: UserSchema.optional().nullable(),
    date: z.string(),
    message: z.string().optional().nullable(),
    status: z.string(),
    descriptionSnapshot: z.string().optional().nullable(),
    titleSnapshot: z.string().optional().nullable(),
    problemSnapshot: z.string().optional().nullable(),
    targetAudienceSnapshot: z.string().optional().nullable(),
    uniquenessSnapshot: z.string().optional().nullable(),
    problemCohesionSnapshot: z.number().optional().nullable(),
    audiencePrecisionSnapshot: z.number().optional().nullable(),
    alignmentScoreSnapshot: z.number().optional().nullable(),
    uniquenessScoreSnapshot: z.number().optional().nullable(),
});

export const NotificationSchema = z.object({
    id: z.number(),
    projectId: z.number().optional().nullable(),
    teacher: UserSchema.optional().nullable(),
    date: z.string(),
    message: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    isRead: z.boolean().default(false),
});

export const SimilarityProjectSchema = ProjectCardSchema.extend({
    weighted_sim: z.number(),
});

export const ProjectCandidateSchema = z.object({
    project_id: z.number(),
    title: z.string(),
    problem_similarity: z.number().nullable(),
    audience_similarity: z.number().nullable(),
    overall_similarity: z.number(),
});

export const UniquenessCompareSchema = z.object({
    candidates: z.array(ProjectCandidateSchema),
});


export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;
export type Category = z.infer<typeof CategorySchema>;
export type ProjectCard = z.infer<typeof ProjectCardSchema>;
export type ProjectReview = z.infer<typeof ProjectReviewSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type HistoryElement = z.infer<typeof HistoryElementSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type SimilarityProject = z.infer<typeof SimilarityProjectSchema>;
export type UniquenessCompareResult = z.infer<typeof UniquenessCompareSchema>;