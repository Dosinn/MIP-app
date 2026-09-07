package com.projekty.projekty.Team;

import com.projekty.projekty.User.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {
    List<TeamMembership> findByTeam(Team team);
    Optional<TeamMembership> findByUser(User user);
    boolean existsByUser(User user);
}
