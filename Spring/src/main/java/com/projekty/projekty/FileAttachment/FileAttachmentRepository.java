package com.projekty.projekty.FileAttachment;

import com.projekty.projekty.Project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileAttachmentRepository extends JpaRepository<FileAttachment, Long> {
    List<FileAttachment> findByProject(Project project);
}
