package com.projekty.projekty.ProjectHistory;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import com.projekty.projekty.Project.Project;
import com.projekty.projekty.User.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectHistory implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HistoryStatus status;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "description_snapshot", columnDefinition = "TEXT")
    private String descriptionSnapshot;

    @Column(name = "title_snapshot")
    private String titleSnapshot;

    @Column(name = "problem_snapshot", columnDefinition = "TEXT")
    private String problemSnapshot;

    @Column(name = "target_audience_snapshot", columnDefinition = "TEXT")
    private String targetAudienceSnapshot;

    @Column(name = "uniqueness_snapshot", columnDefinition = "TEXT")
    private String uniquenessSnapshot;

    @Column(name = "problem_cohesion_snapshot")
    private Double problemCohesionSnapshot;

    @Column(name = "audience_precision_snapshot")
    private Double audiencePrecisionSnapshot;

    @Column(name = "alignment_score_snapshot")
    private Double alignmentScoreSnapshot;

    @Column(name = "uniqueness_score_snapshot")
    private Double uniquenessScoreSnapshot;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
