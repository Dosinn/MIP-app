package com.projekty.projekty.FileAttachment;

import java.time.LocalDateTime;

public record FileAttachmentResponse(
        Long id,
        String fileName,
        String fileUrl,
        String viewUrl,
        Long fileSize,
        LocalDateTime uploadedAt
) {
    public static FileAttachmentResponse from(FileAttachment file) {
        return new FileAttachmentResponse(
                file.getId(),
                file.getFileName(),
                "/files/" + file.getId() + "/download",
                "/files/" + file.getId() + "/view",
                file.getFileSize(),
                file.getUploadedAt()
        );
    }
}
