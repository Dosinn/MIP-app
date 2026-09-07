package com.projekty.projekty.ProjectSection;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ProjectSectionFactory {

    public ProjectSection create(String name, String description, int orderIndex,
                                  LocalDateTime startsAt, LocalDateTime endsAt) {
        return ProjectSection.builder()
                .name(name)
                .description(description)
                .orderIndex(orderIndex)
                .startsAt(startsAt)
                .endsAt(endsAt)
                .locked(false)
                .build();
    }
}
