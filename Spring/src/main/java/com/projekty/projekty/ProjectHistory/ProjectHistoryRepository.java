package com.projekty.projekty.ProjectHistory;

import com.projekty.projekty.Project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectHistoryRepository extends JpaRepository<ProjectHistory, Long> {
    List<ProjectHistory> findByProjectOrderByCreatedAtDesc(Project project);
}
