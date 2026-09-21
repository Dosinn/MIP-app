package com.projekty.projekty.Project;

import com.projekty.projekty.Team.Team;
import com.projekty.projekty.User.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByTeam(Team team);
    Optional<Project> findByTeamAndArchivedFalse(Team team);
    List<Project> findByImprovesProject(Project improvesProject);

    @Query("SELECT r.project FROM ProjectReview r WHERE r.project.improvesProject = :base AND r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED")
    List<Project> findApprovedByImprovesProject(@Param("base") Project base);

    List<Project> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED")
    List<Project> findApprovedProjects();

    @Query("SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED AND LOWER(r.project.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Project> findApprovedProjectsByTitleContainingIgnoreCase(@Param("title") String title);

    @Query(value = "SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED ORDER BY r.project.id DESC",
           countQuery = "SELECT count(r) FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED")
    Page<Project> findApprovedProjects(Pageable pageable);

    @Query(value = "SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED AND LOWER(r.project.title) LIKE LOWER(CONCAT('%', :title, '%')) ORDER BY r.project.id DESC",
           countQuery = "SELECT count(r) FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED AND LOWER(r.project.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Project> findApprovedProjectsByTitleContainingIgnoreCase(@Param("title") String title, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m LEFT JOIN TeamMembership tm ON tm.team = p.team WHERE (m = :user OR tm.user = :user) AND p.archived = true")
    List<Project> findArchivedProjectsByUser(@Param("user") User user);

    @Query("SELECT DISTINCT p FROM Project p JOIN ProjectReview pr ON pr.project = p WHERE pr.lesson.teacher = :teacher AND p.archived = true")
    List<Project> findArchivedProjectsByTeacher(@Param("teacher") User teacher);

    List<Project> findByArchivedTrue();

    @Query("SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED " +
       "AND r.project.category.id IN :categoryIds")
    List<Project> findApprovedByCategories(@Param("categoryIds") List<Long> categoryIds);

    @Query(value = "SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED AND r.project.category.id IN :categoryIds ORDER BY r.project.id DESC",
           countQuery = "SELECT count(r) FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED AND r.project.category.id IN :categoryIds")
    Page<Project> findApprovedByCategories(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);

    @Query("SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED " +
       "AND LOWER(r.project.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
       "AND r.project.category.id IN :categoryIds")
    List<Project> findApprovedByTitleAndCategories(@Param("title") String title, @Param("categoryIds") List<Long> categoryIds);

    @Query(value = "SELECT r.project FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED AND LOWER(r.project.title) LIKE LOWER(CONCAT('%', :title, '%')) AND r.project.category.id IN :categoryIds ORDER BY r.project.id DESC",
           countQuery = "SELECT count(r) FROM ProjectReview r WHERE r.status = com.projekty.projekty.ProjectReview.ReviewStatus.APPROVED AND LOWER(r.project.title) LIKE LOWER(CONCAT('%', :title, '%')) AND r.project.category.id IN :categoryIds")
    Page<Project> findApprovedByTitleAndCategories(@Param("title") String title, @Param("categoryIds") List<Long> categoryIds, Pageable pageable);
}

