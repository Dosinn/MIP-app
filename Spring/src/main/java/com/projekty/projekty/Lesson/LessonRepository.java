package com.projekty.projekty.Lesson;

import com.projekty.projekty.User.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTeacherAndActiveTrue(User teacher);
}
