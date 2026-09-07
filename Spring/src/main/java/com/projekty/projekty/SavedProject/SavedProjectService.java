package com.projekty.projekty.SavedProject;

import com.projekty.projekty.Project.Project;
import com.projekty.projekty.Project.ProjectService;
import com.projekty.projekty.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedProjectService {

    private final SavedProjectRepository savedProjectRepository;
    private final ProjectService projectService;

    public List<Project> getSavedProjects(User user) {
        return savedProjectRepository.findByUserOrderBySavedAtDesc(user).stream()
                .map(SavedProject::getProject)
                .toList();
    }

    public List<Long> getSavedProjectIds(User user) {
        return savedProjectRepository.findSavedProjectIdsByUser(user);
    }

    public boolean isProjectSaved(User user, Long projectId) {
        Project project = projectService.getProjectById(projectId);
        return savedProjectRepository.existsByUserAndProject(user, project);
    }

    @Transactional
    public void saveProject(User user, Long projectId) {
        Project project = projectService.getProjectById(projectId);
        if (!savedProjectRepository.existsByUserAndProject(user, project)) {
            SavedProject savedProject = SavedProject.builder()
                    .user(user)
                    .project(project)
                    .build();
            savedProjectRepository.save(savedProject);
        }
    }

    @Transactional
    public void unsaveProject(User user, Long projectId) {
        Project project = projectService.getProjectById(projectId);
        savedProjectRepository.deleteByUserAndProject(user, project);
    }
}
