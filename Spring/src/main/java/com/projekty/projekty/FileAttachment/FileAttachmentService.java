package com.projekty.projekty.FileAttachment;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.CustomException.FileAttachmentNotFoundException;
import com.projekty.projekty.CustomException.SectionClosedException;
import com.projekty.projekty.Project.Project;
import com.projekty.projekty.Project.ProjectService;
import com.projekty.projekty.ProjectSection.ProjectSection;
import com.projekty.projekty.ProjectSection.ProjectSectionService;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FileAttachmentService {

    private final FileAttachmentRepository fileAttachmentRepository;
    private final FileAttachmentFactory fileAttachmentFactory;
    private final FileStorageService fileStorageService;
    private final ProjectService projectService;
    private final ProjectSectionService projectSectionService;
    private final TeamMembershipService teamMembershipService;
    private final com.projekty.projekty.ProjectReview.ProjectReviewRepository projectReviewRepository;

    public FileAttachment uploadFile(User uploader, Long projectId, Long sectionId, MultipartFile file) {
        Project project = projectService.getProjectById(projectId);
        ProjectSection section = projectSectionService.getSectionById(sectionId);

        if (!teamMembershipService.isMember(project.getTeam(), uploader)) {
            throw new AccessForbiddenException("Only members of this project's team can upload files");
        }

        if (!projectSectionService.isOpenForSubmission(section)) {
            throw new SectionClosedException("This section is not open for submissions right now");
        }

        String storedFileName = fileStorageService.storeFile(file);
        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";

        FileAttachment attachment = fileAttachmentFactory.create(
                project, section, originalFileName, storedFileName, file.getSize(), uploader
        );

        projectReviewRepository.findByProject(project).ifPresent(review -> {
            if (review.getStatus() == com.projekty.projekty.ProjectReview.ReviewStatus.RETURNED_BY_TEACHER) {
                review.setStatus(com.projekty.projekty.ProjectReview.ReviewStatus.PENDING);
                projectReviewRepository.save(review);
            }
        });

        return fileAttachmentRepository.save(attachment);
    }

    public List<FileAttachment> getFilesForProject(Project project) {
        return fileAttachmentRepository.findByProject(project);
    }

    public FileAttachment getFileById(Long id) {
        return fileAttachmentRepository.findById(id)
                .orElseThrow(() -> new FileAttachmentNotFoundException("File not found with id: " + id));
    }

    public Resource loadFileForDownload(Long id) {
        FileAttachment file = getFileById(id);
        return fileStorageService.loadFileAsResource(file.getFilePath());
    }

    public void deleteFile(User currentUser, Long fileId) {
        FileAttachment file = getFileById(fileId);

        boolean isUploader = file.getUploadedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getUserRole() == UserRole.ADMIN;

        if (!isUploader && !isAdmin) {
            throw new AccessForbiddenException("Only the uploader or an admin can delete this file");
        }

        fileStorageService.deleteFile(file.getFilePath());
        fileAttachmentRepository.delete(file);
    }
}
