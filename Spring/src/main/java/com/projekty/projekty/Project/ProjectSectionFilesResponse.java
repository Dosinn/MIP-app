package com.projekty.projekty.Project;

import com.projekty.projekty.FileAttachment.FileAttachmentResponse;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectSectionFilesResponse(
        Long sectionId,
        String sectionName,
        String sectionDescription,
        List<FileAttachmentResponse> sectionFiles,
        boolean locked,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        boolean openForSubmission
) {}

