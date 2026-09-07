package com.projekty.projekty.ProjectSection;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.CustomException.ProjectSectionNotFoundException;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectSectionService {

    private final ProjectSectionRepository projectSectionRepository;
    private final ProjectSectionFactory projectSectionFactory;

    public ProjectSection createSection(User currentUser, String name, String description, int orderIndex,
                                         LocalDateTime startsAt, LocalDateTime endsAt) {
        assertIsAdmin(currentUser);

        ProjectSection section = projectSectionFactory.create(name, description, orderIndex, startsAt, endsAt);
        return projectSectionRepository.save(section);
    }

    public ProjectSection getSectionById(Long id) {
        return projectSectionRepository.findById(id)
                .orElseThrow(() -> new ProjectSectionNotFoundException("Section not found with id: " + id));
    }

    public List<ProjectSection> getAllSections() {
        List<ProjectSection> sections = projectSectionRepository.findAllByOrderByOrderIndexAsc();
        if (sections.isEmpty()) {
            ProjectSection s1 = projectSectionFactory.create("1. Zameranie projektu", "Vymedzenie témy a cieľov projektu", 1, null, null);
            ProjectSection s2 = projectSectionFactory.create("2. Projektový plán", "Detailný harmonogram a rozdelenie úloh", 2, null, null);
            ProjectSection s3 = projectSectionFactory.create("3. APVV formulár", "Projektová žiadosť a rozpočet", 3, null, null);
            ProjectSection s4 = projectSectionFactory.create("4. Finálny článok", "Záverečný vedecko-odborný článok", 4, null, null);
            projectSectionRepository.saveAll(List.of(s1, s2, s3, s4));
            return projectSectionRepository.findAllByOrderByOrderIndexAsc();
        }
        return sections;
    }

    public ProjectSection setLocked(User currentUser, Long id, boolean locked) {
        assertIsAdmin(currentUser);

        ProjectSection section = getSectionById(id);
        section.setLocked(locked);
        return projectSectionRepository.save(section);
    }

    public ProjectSection updateWindow(User currentUser, Long id, LocalDateTime startsAt, LocalDateTime endsAt) {
        assertIsAdmin(currentUser);

        ProjectSection section = getSectionById(id);
        section.setStartsAt(startsAt);
        section.setEndsAt(endsAt);
        return projectSectionRepository.save(section);
    }

    public boolean isOpenForSubmission(ProjectSection section) {
        if (section == null || section.isLocked()) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        if (section.getStartsAt() != null && now.isBefore(section.getStartsAt())) {
            return false;
        }
        if (section.getEndsAt() != null && now.isAfter(section.getEndsAt())) {
            return false;
        }
        return true;
    }

    public ProjectSection updateSection(User currentUser, Long id, String name, String description,
                                         int orderIndex, LocalDateTime startsAt, LocalDateTime endsAt) {
        assertIsAdmin(currentUser);

        ProjectSection section = getSectionById(id);
        section.setName(name);
        section.setDescription(description);
        section.setOrderIndex(orderIndex);
        section.setStartsAt(startsAt);
        section.setEndsAt(endsAt);
        return projectSectionRepository.save(section);
    }

    public void deleteSection(User currentUser, Long id) {
        assertIsAdmin(currentUser);
        ProjectSection section = getSectionById(id);
        projectSectionRepository.delete(section);
    }

    private void assertIsAdmin(User currentUser) {
        if (currentUser.getUserRole() != UserRole.ADMIN) {
            throw new AccessForbiddenException("Only admins can manage project sections");
        }
    }
}
