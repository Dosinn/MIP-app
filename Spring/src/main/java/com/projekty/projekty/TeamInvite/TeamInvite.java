package com.projekty.projekty.TeamInvite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import com.projekty.projekty.User.User;
import com.projekty.projekty.Team.Team;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_invites")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamInvite implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = true)
    private Team team;

    @ManyToOne
    @JoinColumn(name = "invited_user_id", nullable = false)
    private User invitedUser;

    @ManyToOne
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InviteStatus status;

    @Column(name = "invite_token", nullable = false, unique = true)
    private String inviteToken;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
