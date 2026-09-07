package com.projekty.projekty.Project;

import com.projekty.projekty.FileAttachment.FileAttachment;
import com.projekty.projekty.FileAttachment.FileAttachmentRepository;
import com.projekty.projekty.FileAttachment.FileAttachmentResponse;
import com.projekty.projekty.ProjectSection.ProjectSection;
import com.projekty.projekty.ProjectReview.ProjectReview;
import com.projekty.projekty.ProjectReview.ProjectReviewRepository;
import com.projekty.projekty.Team.Team;
import com.projekty.projekty.Team.TeamMembership;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.Team.TeamResponse;
import com.projekty.projekty.Team.TeamService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.util.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.projekty.projekty.ProjectSection.ProjectSectionService;
import com.projekty.projekty.SavedProject.SavedProjectService;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final ProjectReviewRepository projectReviewRepository;
    private final TeamService teamService;
    private final TeamMembershipService teamMembershipService;
    private final FileAttachmentRepository fileAttachmentRepository;
    private final CurrentUserProvider currentUserProvider;
    private final SavedProjectService savedProjectService;
    private final ProjectSectionService projectSectionService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody CreateProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = projectService.createProject(
                currentUser,
                request.title(),
                request.description(),
                request.problem(),
                request.targetAudience(),
                request.uniqueness(),
                request.lessonId(),
                request.improvesProjectId(),
                request.categoryId(),
                request.problemCohesion(),
                request.audiencePrecision(),
                request.alignmentScore(),
                request.uniquenessScore(),
                request.hasContrastiveMarkers()
        );
        return ResponseEntity.ok(buildFullResponse(project));
    }

    @GetMapping("/my")
    public ResponseEntity<ProjectCardResponse> getMyProject() {
        User currentUser = currentUserProvider.getCurrentUser();
        return teamService.getMyTeam(currentUser)
                .flatMap(projectRepository::findByTeamAndArchivedFalse)
                .map(this::buildCardResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/archived/my")
    public ResponseEntity<List<ProjectCardResponse>> getMyArchivedProjects() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<ProjectCardResponse> response = projectService.getMyArchivedProjects(currentUser).stream()
                .map(this::buildCardResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<ProjectCardResponse> archiveProject(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = projectService.archiveProject(currentUser, id);
        return ResponseEntity.ok(buildCardResponse(project));
    }

    @PostMapping("/{id}/unarchive")
    public ResponseEntity<ProjectCardResponse> unarchiveProject(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = projectService.unarchiveProject(currentUser, id);
        return ResponseEntity.ok(buildCardResponse(project));
    }

    @PostMapping("/archive-year")
    public ResponseEntity<Void> archiveSchoolYear() {
        User currentUser = currentUserProvider.getCurrentUser();
        projectService.archiveAllProjects(currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/saved")
    public ResponseEntity<List<ProjectCardResponse>> getSavedProjects() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<ProjectCardResponse> response = savedProjectService.getSavedProjects(currentUser).stream()
                .map(this::buildCardResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/saved/ids")
    public ResponseEntity<List<Long>> getSavedProjectIds() {
        User currentUser = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(savedProjectService.getSavedProjectIds(currentUser));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveProject(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        savedProjectService.saveProject(currentUser, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveProject(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        savedProjectService.unsaveProject(currentUser, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        return ResponseEntity.ok(buildFullResponse(project));
    }

    @GetMapping
    public ResponseEntity<List<ProjectCardResponse>> getLibrary(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<Long> categoryIds
    ) {
        List<Project> projects = projectService.getLibrary(search, categoryIds);
        List<ProjectCardResponse> response = projects.stream().map(this::buildCardResponse).toList();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        projectService.deleteProject(currentUser, id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id,
                                                          @Valid @RequestBody UpdateProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = projectService.updateProject(
                currentUser,
                id,
                request.title(),
                request.description(),
                request.problem(),
                request.targetAudience(),
                request.uniqueness(),
                request.categoryId(),
                request.problemCohesion(),
                request.audiencePrecision(),
                request.alignmentScore(),
                request.uniquenessScore(),
                request.hasContrastiveMarkers()
        );
        return ResponseEntity.ok(buildFullResponse(project));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<ProjectCardResponse> rateProject(@PathVariable Long id,
                                                             @Valid @RequestBody RateProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = projectService.rateProject(currentUser, id, request.rating());
        return ResponseEntity.ok(buildCardResponse(project));
    }

    private TeamResponse getTeamResponse(Project project) {
        Team team = project.getTeam();
        List<TeamMembership> members = teamMembershipService.getMembers(team);
        if (members.isEmpty() && project.getMembers() != null && !project.getMembers().isEmpty()) {
            return TeamResponse.fromUsers(team, project.getMembers());
        }
        return TeamResponse.from(team, members);
    }

    private ProjectCardResponse buildCardResponse(Project project) {
        TeamResponse teamResponse = getTeamResponse(project);
        String status = projectReviewRepository.findByProject(project)
                .map(r -> r.getStatus().name().toLowerCase())
                .orElse("pending");
        return ProjectCardResponse.from(project, teamResponse, status);
    }

    private ProjectResponse buildFullResponse(Project project) {
        TeamResponse teamResponse = getTeamResponse(project);

        Map<Long, List<FileAttachmentResponse>> filesBySection = new LinkedHashMap<>();
        for (FileAttachment file : fileAttachmentRepository.findByProject(project)) {
            Long sectionId = file.getSection().getId();
            filesBySection.computeIfAbsent(sectionId, id -> new java.util.ArrayList<>())
                    .add(FileAttachmentResponse.from(file));
        }

        List<ProjectSectionFilesResponse> sections = projectSectionService.getAllSections().stream()
                .map(section -> new ProjectSectionFilesResponse(
                        section.getId(),
                        section.getName(),
                        section.getDescription(),
                        filesBySection.getOrDefault(section.getId(), List.of()),
                        section.isLocked(),
                        section.getStartsAt(),
                        section.getEndsAt(),
                        projectSectionService.isOpenForSubmission(section)
                ))
                .toList();

        List<ProjectCardResponse> improves = projectService.getImprovedVersionsOf(project.getId()).stream()
                .map(this::buildCardResponse)
                .toList();

        String status = projectReviewRepository.findByProject(project)
                .map(r -> r.getStatus().name().toLowerCase())
                .orElse("pending");

        ProjectCardResponse improvedFrom = project.getImprovesProject() != null
                ? buildCardResponse(project.getImprovesProject())
                : null;

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getProblem(),
                project.getTargetAudience(),
                project.getUniqueness(),
                teamResponse,
                project.getRating(),
                sections,
                improves,
                status,
                improvedFrom,
                project.isArchived(),
                project.getProblemCohesion(),
                project.getAudiencePrecision(),
                project.getAlignmentScore(),
                project.getUniquenessScore(),
                project.isHasContrastiveMarkers(),
                project.getCategory() != null
                        ? com.projekty.projekty.Category.CategoryResponse.from(project.getCategory())
                        : null
        );
    }
}

