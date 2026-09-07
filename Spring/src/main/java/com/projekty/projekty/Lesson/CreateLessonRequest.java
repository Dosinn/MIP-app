package com.projekty.projekty.Lesson;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CreateLessonRequest(
        @Min(0) @Max(6) int dayOfWeek,
        @Min(0) @Max(23) int hour,
        @Min(0) @Max(24) Integer endHour,
        String room,
        Long teacherId,
        String type
) {}

