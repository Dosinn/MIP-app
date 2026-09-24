package com.projekty.projekty.Project;

import com.projekty.projekty.Category.Category;
import com.projekty.projekty.Category.CategoryRepository;
import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.CustomException.ProjectNotFoundException;
import com.projekty.projekty.CustomException.TeacherMismatchException;
import com.projekty.projekty.CustomException.TeamAlreadyHasProjectException;
import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Lesson.LessonService;
import com.projekty.projekty.ProjectReview.ProjectReview;
import com.projekty.projekty.ProjectReview.ProjectReviewFactory;
import com.projekty.projekty.ProjectReview.ProjectReviewRepository;
import com.projekty.projekty.ProjectReview.ReviewStatus;
import com.projekty.projekty.Team.Team;
import com.projekty.projekty.Team.TeamMembership;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.Team.TeamService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectFactory projectFactory;
    private final TeamService teamService;
    private final TeamMembershipService teamMembershipService;
    private final LessonService lessonService;
    private final ProjectReviewRepository projectReviewRepository;
    private final ProjectReviewFactory projectReviewFactory;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Project createProject(
            User creator,
            String title,
            String description,
            String problem,
            String targetAudience,
            String uniqueness,
            Long lessonId,
            Long improvesProjectId,
            Long categoryId,
            Double problemCohesion,
            Double audiencePrecision,
            Double alignmentScore,
            Double uniquenessScore,
            Boolean hasContrastiveMarkers
    ) {
        Team team = teamService.getOrCreateMyTeam(creator);

        if (projectRepository.findByTeamAndArchivedFalse(team).isPresent()) {
            throw new TeamAlreadyHasProjectException("Your team already has an active project");
        }

        Lesson lesson = lessonService.getLessonById(lessonId);

        if (lesson.getType() != null && "LECTURE".equalsIgnoreCase(lesson.getType().trim())) {
            throw new AccessForbiddenException("Lectures cannot be selected as a practice lesson");
        }

        User creatorTeacher = creator.getTeacher();
        if (creatorTeacher == null || !lesson.getTeacher().getId().equals(creatorTeacher.getId())) {
            throw new TeacherMismatchException("Selected lesson does not belong to your teacher");
        }

        Project improvesProject = improvesProjectId != null ? getProjectById(improvesProjectId) : null;
        Category category = categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;

        Project project = projectFactory.create(
                title, description, problem, targetAudience, uniqueness,
                team, improvesProject, category,
                problemCohesion, audiencePrecision, alignmentScore, uniquenessScore, hasContrastiveMarkers
        );
        List<TeamMembership> teamMembers = teamMembershipService.getMembers(team);
        project.setMembers(new java.util.ArrayList<>(teamMembers.stream().map(TeamMembership::getUser).toList()));
        project = projectRepository.save(project);

        ProjectReview review = projectReviewFactory.create(project, lesson);
        projectReviewRepository.save(review);

        return project;
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));
    }

    public List<Project> getLibrary() {
        return projectRepository.findApprovedProjects();
    }

    public List<Project> getLibrary(String search, List<Long> categoryIds) {
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasCategories = categoryIds != null && !categoryIds.isEmpty();

        if (hasSearch && hasCategories) {
            return projectRepository.findApprovedByTitleAndCategories(search, categoryIds);
        } else if (hasSearch) {
            return projectRepository.findApprovedProjectsByTitleContainingIgnoreCase(search);
        } else if (hasCategories) {
            return projectRepository.findApprovedByCategories(categoryIds);
        } else {
            return projectRepository.findApprovedProjects();
        }
    }

    public Page<Project> getLibrary(String search, List<Long> categoryIds, Pageable pageable) {
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasCategories = categoryIds != null && !categoryIds.isEmpty();

        if (hasSearch && hasCategories) {
            return projectRepository.findApprovedByTitleAndCategories(search, categoryIds, pageable);
        } else if (hasSearch) {
            return projectRepository.findApprovedProjectsByTitleContainingIgnoreCase(search, pageable);
        } else if (hasCategories) {
            return projectRepository.findApprovedByCategories(categoryIds, pageable);
        } else {
            return projectRepository.findApprovedProjects(pageable);
        }
    }

    public List<Project> getImprovedVersionsOf(Long projectId) {
        Project base = getProjectById(projectId);
        return projectRepository.findApprovedByImprovesProject(base);
    }

    public Project archiveProject(User currentUser, Long projectId) {
        Project project = getProjectById(projectId);
        if (currentUser.getUserRole() != com.projekty.projekty.User.UserRole.ADMIN && currentUser.getUserRole() != com.projekty.projekty.User.UserRole.TEACHER) {
            throw new AccessForbiddenException("Only teachers and admins can archive projects");
        }
        project.setArchived(true);
        List<TeamMembership> teamMembers = teamMembershipService.getMembers(project.getTeam());
        if (!teamMembers.isEmpty()) {
            List<com.projekty.projekty.User.User> members = teamMembers.stream().map(TeamMembership::getUser).toList();
            project.setMembers(new java.util.ArrayList<>(members));
            // Reset onboarding only for students so they pick a new teacher next year
            List<com.projekty.projekty.User.User> students = members.stream()
                    .filter(u -> u.getUserRole() == com.projekty.projekty.User.UserRole.STUDENT)
                    .toList();
            students.forEach(u -> {
                u.setOnboarded(false);
                u.setTeacher(null);
            });
            if (!students.isEmpty()) userRepository.saveAll(students);
        }
        project = projectRepository.save(project);
        teamMembershipService.unassignAllMembers(project.getTeam());
        return project;
    }

    public Project unarchiveProject(User currentUser, Long projectId) {
        Project project = getProjectById(projectId);
        if (currentUser.getUserRole() != com.projekty.projekty.User.UserRole.ADMIN && currentUser.getUserRole() != com.projekty.projekty.User.UserRole.TEACHER) {
            throw new AccessForbiddenException("Only teachers and admins can unarchive projects");
        }
        project.setArchived(false);
        return projectRepository.save(project);
    }

    public List<Project> getMyArchivedProjects(User currentUser) {
        if (currentUser.getUserRole() == com.projekty.projekty.User.UserRole.ADMIN) {
            return projectRepository.findByArchivedTrue();
        } else if (currentUser.getUserRole() == com.projekty.projekty.User.UserRole.TEACHER) {
            return projectRepository.findArchivedProjectsByTeacher(currentUser);
        } else {
            return projectRepository.findArchivedProjectsByUser(currentUser);
        }
    }

    public void archiveAllProjects(User currentUser) {
        if (currentUser.getUserRole() != com.projekty.projekty.User.UserRole.ADMIN) {
            throw new AccessForbiddenException("Only admins can perform bulk archive");
        }
        List<Project> active = projectRepository.findAll().stream()
                .filter(p -> !p.isArchived())
                .toList();
        for (Project project : active) {
            project.setArchived(true);
            List<TeamMembership> teamMembers = teamMembershipService.getMembers(project.getTeam());
            if (!teamMembers.isEmpty()) {
                List<com.projekty.projekty.User.User> members = teamMembers.stream().map(TeamMembership::getUser).toList();
                project.setMembers(new java.util.ArrayList<>(members));
                // Reset onboarding only for students so they pick a new teacher next year
                List<com.projekty.projekty.User.User> students = members.stream()
                        .filter(u -> u.getUserRole() == com.projekty.projekty.User.UserRole.STUDENT)
                        .toList();
                students.forEach(u -> {
                    u.setOnboarded(false);
                    u.setTeacher(null);
                });
                if (!students.isEmpty()) userRepository.saveAll(students);
            }
            teamMembershipService.unassignAllMembers(project.getTeam());
        }
        projectRepository.saveAll(active);
    }

    public Project rateProject(User currentUser, Long projectId, double rating) {
        Project project = getProjectById(projectId);

        if (!teamMembershipService.isMember(project.getTeam(), currentUser)) {
            throw new AccessForbiddenException("Only team members can rate their own project");
        }

        ProjectReview review = projectReviewRepository.findByProject(project)
                .orElseThrow(() -> new AccessForbiddenException("This project has no review yet"));

        if (review.getStatus() != ReviewStatus.APPROVED) {
            throw new AccessForbiddenException("You can only rate a project after it has been approved");
        }

        project.setRating(rating);
        return projectRepository.save(project);
    }

    public void deleteProject(User currentUser, Long projectId) {
        Project project = getProjectById(projectId);

        if (!teamMembershipService.isMember(project.getTeam(), currentUser)) {
            throw new AccessForbiddenException("Only team members can delete their own project");
        }

        projectReviewRepository.findByProject(project).ifPresent(projectReviewRepository::delete);
        projectRepository.delete(project);
    }

    public Project updateProject(
            User currentUser,
            Long projectId,
            String title,
            String description,
            String problem,
            String targetAudience,
            String uniqueness,
            Long categoryId,
            Double problemCohesion,
            Double audiencePrecision,
            Double alignmentScore,
            Double uniquenessScore,
            Boolean hasContrastiveMarkers
    ) {
        Project project = getProjectById(projectId);

        if (!teamMembershipService.isMember(project.getTeam(), currentUser)) {
            throw new AccessForbiddenException("Only team members can edit their own project");
        }

        project.setTitle(title);
        project.setDescription(description);
        if (problem != null) project.setProblem(problem);
        if (targetAudience != null) project.setTargetAudience(targetAudience);
        if (uniqueness != null) project.setUniqueness(uniqueness);
        if (problemCohesion != null) project.setProblemCohesion(problemCohesion);
        if (audiencePrecision != null) project.setAudiencePrecision(audiencePrecision);
        if (alignmentScore != null) project.setAlignmentScore(alignmentScore);
        if (uniquenessScore != null) project.setUniquenessScore(uniquenessScore);
        if (hasContrastiveMarkers != null) project.setHasContrastiveMarkers(hasContrastiveMarkers);
        if (categoryId != null) {
            categoryRepository.findById(categoryId).ifPresent(project::setCategory);
        }

        projectReviewRepository.findByProject(project).ifPresent(review -> {
            if (review.getStatus() == ReviewStatus.RETURNED_BY_TEACHER) {
                review.setStatus(ReviewStatus.PENDING);
                projectReviewRepository.save(review);
            }
        });

        return projectRepository.save(project);
    }
}
