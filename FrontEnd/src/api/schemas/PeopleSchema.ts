import { z } from 'zod';

export const RoleSchema = z.enum(['student', 'teacher', 'admin']);

export const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    teacherId: z.number().nullable().optional(),
    onboarded: z.boolean().optional(),
    isTeacher: z.boolean().optional(),
});

export const TeamSchema = z.object({
    id: z.number(),
    members: z.array(UserSchema),
    year: z.number(),
});

export const TeacherLessonSchema = z.object({
    lessonId: z.number(),
    dayOfWeek: z.number().int().min(0).max(6),
    hour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(0).max(24).optional(),
    room: z.string().optional(),
    type: z.string().optional(),
});

export const TeacherSchema = UserSchema.extend({
    lessons: z.array(TeacherLessonSchema).optional(),
});

export const LessonResponseSchema = z.object({
    id: z.number(),
    teacherId: z.number().optional(),
    teacherName: z.string().optional(),
    dayOfWeek: z.number(),
    hour: z.number(),
    endHour: z.number().optional(),
    room: z.string().optional(),
    type: z.string().optional(),
    active: z.boolean().optional(),
});

export type Role = z.infer<typeof RoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Lesson = z.infer<typeof TeacherLessonSchema>;
export type LessonResponse = z.infer<typeof LessonResponseSchema>;
export type Teacher = z.infer<typeof TeacherSchema>;