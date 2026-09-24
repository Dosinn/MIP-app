package com.projekty.projekty.Project;

import com.projekty.projekty.Team.Team;
import com.projekty.projekty.Team.TeamMembership;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRepository;
import com.projekty.projekty.User.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class HistoricalProjectsMigration {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamMembershipService teamMembershipService;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateHistoricalProjects() {
        try {
            List<Project> allProjects = projectRepository.findAll();
            int migratedProjects = 0;
            int migratedUsers = 0;

            for (Project project : allProjects) {
                Team team = project.getTeam();
                boolean isPastYear = team != null && team.getYear() < 2026;
                boolean isArchived = project.isArchived();

                if (!isPastYear && !isArchived) {
                    continue;
                }

                if (!project.isArchived()) {
                    project.setArchived(true);
                }

                // Collect members from project_members and team memberships
                List<TeamMembership> teamMembers = team != null ? teamMembershipService.getMembers(team) : List.of();
                Set<User> membersToProcess = new HashSet<>(project.getMembers());
                for (TeamMembership tm : teamMembers) {
                    if (tm.getUser() != null) {
                        membersToProcess.add(tm.getUser());
                    }
                }

                // Ensure project_members table keeps track of these authors
                if (project.getMembers().isEmpty() && !membersToProcess.isEmpty()) {
                    project.setMembers(new ArrayList<>(membersToProcess));
                }

                for (User user : membersToProcess) {
                    if (user.getUserRole() == UserRole.STUDENT) {
                        boolean modified = false;
                        String email = user.getEmail();

                        // Migrate email with .2025 so returning students get a clean account via Google login
                        if (email != null && !email.contains(".2025@") && !email.contains(".past@") && !email.startsWith("archived_")) {
                            String newEmail = email.contains("@")
                                    ? email.replace("@", ".2025@")
                                    : email + ".2025";

                            // If newEmail already exists, add user id to make it unique
                            if (userRepository.findByEmail(newEmail).isPresent()) {
                                newEmail = email.contains("@")
                                        ? email.replace("@", ".2025." + user.getId() + "@")
                                        : email + ".2025." + user.getId();
                            }

                            user.setEmail(newEmail);
                            modified = true;
                        }

                        // Remove hanging teacher assignment from past projects
                        if (user.getTeacher() != null) {
                            user.setTeacher(null);
                            modified = true;
                        }

                        if (user.isOnboarded()) {
                            user.setOnboarded(false);
                            modified = true;
                        }

                        if (modified) {
                            userRepository.save(user);
                            migratedUsers++;
                        }
                    }
                }

                if (team != null) {
                    teamMembershipService.unassignAllMembers(team);
                }

                projectRepository.save(project);
                migratedProjects++;
            }

            if (migratedProjects > 0 || migratedUsers > 0) {
                log.info("[MIGRATION] Successfully verified {} historical projects and migrated {} past user accounts.", migratedProjects, migratedUsers);
            }
        } catch (Exception e) {
            log.error("[MIGRATION] Historical projects migration failed: {}", e.getMessage(), e);
        }
    }
}
