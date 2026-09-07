package com.projekty.projekty.FileAttachment;

import java.time.LocalDateTime;

public record FileAttachmentResponse(
        Long id,
        String fileName,
        String fileUrl,
        Long fileSize,
        LocalDateTime uploadedAt
) {
    public static FileAttachmentResponse from(FileAttachment file) {
        return new FileAttachmentResponse(
                file.getId(),
                file.getFileName(),
                "/files/" + file.getId() + "/download",
                file.getFileSize(),
                file.getUploadedAt()
        );
    }
}
