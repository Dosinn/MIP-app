package com.projekty.projekty.FileAttachment;

import com.projekty.projekty.User.User;
import com.projekty.projekty.util.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileAttachmentController {

    private final FileAttachmentService fileAttachmentService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<FileAttachmentResponse> uploadFile(@RequestParam("projectId") Long projectId,
                                                               @RequestParam("sectionId") Long sectionId,
                                                               @RequestParam("file") MultipartFile file) {
        User currentUser = currentUserProvider.getCurrentUser();
        FileAttachment saved = fileAttachmentService.uploadFile(currentUser, projectId, sectionId, file);
        return ResponseEntity.ok(FileAttachmentResponse.from(saved));
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        FileAttachment file = fileAttachmentService.getFileById(fileId);
        Resource resource = fileAttachmentService.loadFileForDownload(fileId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/{fileId}/view")
    public ResponseEntity<Resource> viewFile(@PathVariable Long fileId) {
        FileAttachment file = fileAttachmentService.getFileById(fileId);
        Resource resource = fileAttachmentService.loadFileForDownload(fileId);

        org.springframework.http.MediaType mediaType = org.springframework.http.MediaType.APPLICATION_PDF;
        if (file.getFileName() != null && !file.getFileName().toLowerCase().endsWith(".pdf")) {
            mediaType = org.springframework.http.MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
        User currentUser = currentUserProvider.getCurrentUser();
        fileAttachmentService.deleteFile(currentUser, fileId);
        return ResponseEntity.ok().build();
    }
}
