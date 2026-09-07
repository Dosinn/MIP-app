package com.projekty.projekty.Project;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.projekty.projekty.Team.Team;
import com.projekty.projekty.User.User;
import com.projekty.projekty.Category.Category;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // ── Three dedicated NLP-analysed fields ───────────────────────────────────

    @Column(name = "problem", columnDefinition = "TEXT")
    private String problem;

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "uniqueness", columnDefinition = "TEXT")
    private String uniqueness;

    // ── NLP quality metrics (populated by Python on project creation/update) ──

    /** Semantic cohesion score for the problem field (0.0–1.0) */
    @Column(name = "problem_cohesion")
    private Double problemCohesion;

    /** Audience niche precision score (0.0–1.0) */
    @Column(name = "audience_precision")
    private Double audiencePrecision;

    /** Problem-solution alignment score (0.0–1.0) */
    @Column(name = "alignment_score")
    private Double alignmentScore;

    /** Multi-factor uniqueness / differentiation score (0.0–1.0) */
    @Column(name = "uniqueness_score")
    private Double uniquenessScore;

    /** True if contrastive linguistic markers were detected in uniqueness field */
    @Builder.Default
    @Column(name = "has_contrastive_markers", nullable = false, columnDefinition = "boolean default false")
    private boolean hasContrastiveMarkers = false;

    // ── Category (user-selected from project_categories table) ────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // ── Existing fields ────────────────────────────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "rating")
    private Double rating;

    @ManyToOne
    @JoinColumn(name = "improves_project_id")
    private Project improvesProject;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "title_emb", columnDefinition = "float8[]", nullable = true)
    private Double[] titleEmb = new Double[0];

    @Builder.Default
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "desc_emb", columnDefinition = "float8[]", nullable = true)
    private Double[] descEmb = new Double[0];

    @Builder.Default
    @Column(name = "archived", nullable = false, columnDefinition = "boolean default false")
    private boolean archived = false;

    @ManyToMany
    @JoinTable(
        name = "project_members",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<User> members = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
