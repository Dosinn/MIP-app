package com.projekty.projekty.FileAttachment;

import com.projekty.projekty.Project.Project;
import com.projekty.projekty.ProjectSection.ProjectSection;
import com.projekty.projekty.User.User;
import org.springframework.stereotype.Component;

@Component
public class FileAttachmentFactory {

    public FileAttachment create(Project project, ProjectSection section, String fileName,
                                  String filePath, Long fileSize, User uploadedBy) {
        return FileAttachment.builder()
                .project(project)
                .section(section)
                .fileName(fileName)
                .filePath(filePath)
                .fileSize(fileSize)
                .uploadedBy(uploadedBy)
                .build();
    }
}
