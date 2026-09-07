package com.projekty.projekty.ProjectSection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectSectionRepository extends JpaRepository<ProjectSection, Long> {
    List<ProjectSection> findAllByOrderByOrderIndexAsc();
}
