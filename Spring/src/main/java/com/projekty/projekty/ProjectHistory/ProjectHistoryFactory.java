package com.projekty.projekty.ProjectHistory;

import com.projekty.projekty.Project.Project;
import com.projekty.projekty.User.User;
import org.springframework.stereotype.Component;

@Component
public class ProjectHistoryFactory {

    public ProjectHistory create(Project project, User teacher, HistoryStatus status, String message) {
        return ProjectHistory.builder()
                .project(project)
                .teacher(teacher)
                .status(status)
                .message(message)
                .titleSnapshot(project.getTitle())
                .descriptionSnapshot(project.getDescription())
                .build();
    }
}
