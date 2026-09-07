package com.projekty.projekty.Lesson;

public record TeacherLessonResponse(
        Long lessonId,
        int dayOfWeek,
        int hour,
        int endHour,
        String room,
        String type
) {
    public static TeacherLessonResponse from(Lesson lesson) {
        return new TeacherLessonResponse(
                lesson.getId(),
                lesson.getDayOfWeek(),
                lesson.getHour(),
                lesson.getEffectiveEndHour(),
                lesson.getRoom(),
                lesson.getType() != null ? lesson.getType() : "PRACTICE"
        );
    }
}

