import { z } from 'zod';

export const FileSchema = z.object({
    id: z.number(),
    fileName: z.string(),
    fileUrl: z.string(),
    viewUrl: z.string().optional(),
    fileSize: z.number().optional(),
    uploadedAt: z.string().optional(),
});

export const ProjectFilesSchema = z.object({
    sectionId: z.number().optional(),
    sectionName: z.string(),
    sectionDescription: z.string().optional(),
    sectionFiles: z.array(FileSchema),
    locked: z.boolean().optional(),
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
    openForSubmission: z.boolean().optional(),
});

export const ProjectSectionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    orderIndex: z.number().optional(),
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
    locked: z.boolean().optional(),
});

export type FileAttachment = z.infer<typeof FileSchema>;
export type ProjectFiles = z.infer<typeof ProjectFilesSchema>;
export type ProjectSection = z.infer<typeof ProjectSectionSchema>;