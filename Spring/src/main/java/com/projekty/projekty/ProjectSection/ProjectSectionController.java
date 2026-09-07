package com.projekty.projekty.ProjectSection;

import com.projekty.projekty.User.User;
import com.projekty.projekty.util.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sections")
@RequiredArgsConstructor
public class ProjectSectionController {

    private final ProjectSectionService projectSectionService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<ProjectSectionResponse> createSection(@Valid @RequestBody CreateSectionRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectSection section = projectSectionService.createSection(
                currentUser, request.name(), request.description(), request.orderIndex(),
                request.startsAt(), request.endsAt()
        );
        return ResponseEntity.ok(ProjectSectionResponse.from(section));
    }

    @GetMapping
    public ResponseEntity<List<ProjectSectionResponse>> getAllSections() {
        List<ProjectSectionResponse> response = projectSectionService.getAllSections().stream()
                .map(ProjectSectionResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/window")
    public ResponseEntity<ProjectSectionResponse> updateWindow(@PathVariable Long id,
                                                                 @Valid @RequestBody UpdateSectionWindowRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectSection section = projectSectionService.updateWindow(currentUser, id, request.startsAt(), request.endsAt());
        return ResponseEntity.ok(ProjectSectionResponse.from(section));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectSectionResponse> updateSection(@PathVariable Long id,
                                                                 @Valid @RequestBody UpdateSectionRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProjectSection section = projectSectionService.updateSection(
                currentUser, id, request.name(), request.description(), request.orderIndex(),
                request.startsAt(), request.endsAt()
        );
        return ResponseEntity.ok(ProjectSectionResponse.from(section));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        projectSectionService.deleteSection(currentUser, id);
        return ResponseEntity.ok().build();
    }
}
