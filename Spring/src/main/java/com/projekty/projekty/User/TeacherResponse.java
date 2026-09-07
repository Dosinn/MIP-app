package com.projekty.projekty.User;

import com.projekty.projekty.Lesson.TeacherLessonResponse;

import java.util.List;

public record TeacherResponse(
        Long id,
        String name,
        String email,
        String role,
        List<TeacherLessonResponse> lessons,
        boolean isTeacher
) {
    public static TeacherResponse from(User teacher, List<TeacherLessonResponse> lessons) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getName(),
                teacher.getEmail(),
                teacher.getUserRole().name().toLowerCase(),
                lessons,
                teacher.getUserRole() == UserRole.TEACHER || (teacher.getUserRole() == UserRole.ADMIN && teacher.isTeacher())
        );
    }
}

