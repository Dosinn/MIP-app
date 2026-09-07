package com.projekty.projekty.Lesson;

import com.projekty.projekty.User.User;
import org.springframework.stereotype.Component;

@Component
public class LessonFactory {

    public Lesson create(User teacher, int dayOfWeek, int hour, Integer endHour, String room, String type) {
        return Lesson.builder()
                .teacher(teacher)
                .dayOfWeek(dayOfWeek)
                .hour(hour)
                .endHour(endHour)
                .room(room)
                .type(type != null && !type.isBlank() ? type : "PRACTICE")
                .active(true)
                .build();
    }
}

