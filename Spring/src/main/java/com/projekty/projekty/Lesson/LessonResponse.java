package com.projekty.projekty.Lesson;

public record LessonResponse(
        Long id,
        Long teacherId,
        String teacherName,
        int dayOfWeek,
        int hour,
        int endHour,
        String room,
        String type,
        boolean active
) {
    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTeacher() != null ? lesson.getTeacher().getId() : null,
                lesson.getTeacher() != null ? lesson.getTeacher().getName() : null,
                lesson.getDayOfWeek(),
                lesson.getHour(),
                lesson.getEffectiveEndHour(),
                lesson.getRoom(),
                lesson.getType() != null ? lesson.getType() : "PRACTICE",
                lesson.isActive()
        );
    }
}

