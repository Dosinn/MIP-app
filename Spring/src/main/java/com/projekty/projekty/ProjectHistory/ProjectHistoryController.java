package com.projekty.projekty.ProjectHistory;

import com.projekty.projekty.Project.Project;
import com.projekty.projekty.Project.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/history")
@RequiredArgsConstructor
public class ProjectHistoryController {

    private final ProjectHistoryRepository projectHistoryRepository;
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectHistoryResponse>> getHistory(@PathVariable Long projectId) {
        Project project = projectService.getProjectById(projectId);
        List<ProjectHistoryResponse> response = projectHistoryRepository.findByProjectOrderByCreatedAtDesc(project)
                .stream()
                .map(ProjectHistoryResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }
}
