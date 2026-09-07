package com.projekty.projekty.ProjectReview;

import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Project.Project;
import com.projekty.projekty.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectReviewRepository extends JpaRepository<ProjectReview, Long> {
    Optional<ProjectReview> findByProject(Project project);

    @Query("SELECT r FROM ProjectReview r WHERE r.lesson = :lesson AND r.project.archived = false")
    List<ProjectReview> findByLesson(@Param("lesson") Lesson lesson);

    @Query("SELECT r FROM ProjectReview r WHERE r.lesson.teacher = :teacher AND r.project.archived = false")
    List<ProjectReview> findAllByTeacher(@Param("teacher") User teacher);

    @Query("SELECT r FROM ProjectReview r WHERE r.project.archived = false")
    List<ProjectReview> findAllActive();
}
