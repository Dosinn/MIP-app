package com.projekty.projekty.SavedProject;

import com.projekty.projekty.Project.Project;
import com.projekty.projekty.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SavedProjectRepository extends JpaRepository<SavedProject, Long> {
    List<SavedProject> findByUserOrderBySavedAtDesc(User user);
    Optional<SavedProject> findByUserAndProject(User user, Project project);
    boolean existsByUserAndProject(User user, Project project);
    void deleteByUserAndProject(User user, Project project);

    @Query("SELECT s.project.id FROM SavedProject s WHERE s.user = :user")
    List<Long> findSavedProjectIdsByUser(@Param("user") User user);
}
