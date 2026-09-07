package com.projekty.projekty.Lesson;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.projekty.projekty.User.User;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek;

    @Column(name = "hour", nullable = false)
    private int hour;

    @Column(name = "end_hour")
    private Integer endHour;

    @Column(name = "room")
    private String room;

    @Column(name = "type", length = 30)
    private String type;

    @Column(name = "active", nullable = false)
    private boolean active;

    public int getEffectiveEndHour() {
        if (endHour != null && endHour > hour) {
            return endHour;
        }
        return "LECTURE".equalsIgnoreCase(type) ? hour + 3 : hour + 2;
    }
}
