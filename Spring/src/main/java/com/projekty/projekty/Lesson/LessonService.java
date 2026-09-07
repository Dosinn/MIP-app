package com.projekty.projekty.Lesson;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.CustomException.LessonNotFoundException;
import com.projekty.projekty.CustomException.UserNotFoundException;
import com.projekty.projekty.Project.ProjectRepository;
import com.projekty.projekty.ProjectReview.ProjectReview;
import com.projekty.projekty.ProjectReview.ProjectReviewRepository;
import com.projekty.projekty.Team.TeamService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRepository;
import com.projekty.projekty.User.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonFactory lessonFactory;
    private final TeamService teamService;
    private final ProjectRepository projectRepository;
    private final ProjectReviewRepository projectReviewRepository;
    private final UserRepository userRepository;

    public Lesson createLesson(User currentUser, int dayOfWeek, int hour, Integer endHour, String room, Long teacherId, String type) {
        User targetTeacher = currentUser;
        if (teacherId != null) {
            if (currentUser.getUserRole() != UserRole.ADMIN && !currentUser.getId().equals(teacherId)) {
                throw new AccessForbiddenException("Only admins can create lessons for other teachers");
            }
            targetTeacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new UserNotFoundException("Teacher not found with id: " + teacherId));
        } else {
            if (currentUser.getUserRole() != UserRole.TEACHER && currentUser.getUserRole() != UserRole.ADMIN) {
                throw new AccessForbiddenException("Only teachers or admins can create lessons");
            }
        }

        Lesson lesson = lessonFactory.create(targetTeacher, dayOfWeek, hour, endHour, room, type);
        return lessonRepository.save(lesson);
    }

    public Lesson updateLesson(User currentUser, Long lessonId, int dayOfWeek, int hour, Integer endHour, String room, Long teacherId, String type) {
        Lesson lesson = getLessonById(lessonId);
        if (currentUser.getUserRole() != UserRole.ADMIN && !lesson.getTeacher().getId().equals(currentUser.getId())) {
            throw new AccessForbiddenException("You do not have permission to update this lesson");
        }
        if (teacherId != null && currentUser.getUserRole() == UserRole.ADMIN) {
            User targetTeacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new UserNotFoundException("Teacher not found with id: " + teacherId));
            lesson.setTeacher(targetTeacher);
        }
        lesson.setDayOfWeek(dayOfWeek);
        lesson.setHour(hour);
        lesson.setEndHour(endHour);
        lesson.setRoom(room);
        if (type != null && !type.isBlank()) {
            lesson.setType(type);
        }
        return lessonRepository.save(lesson);
    }

    public void deleteLesson(User currentUser, Long lessonId) {
        Lesson lesson = getLessonById(lessonId);
        if (currentUser.getUserRole() != UserRole.ADMIN && !lesson.getTeacher().getId().equals(currentUser.getId())) {
            throw new AccessForbiddenException("You do not have permission to delete this lesson");
        }
        lesson.setActive(false);
        lessonRepository.save(lesson);
    }

    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new LessonNotFoundException("Lesson not found with id: " + id));
    }

    public List<Lesson> getMyLessons(User currentUser) {
        if (currentUser.getUserRole() == UserRole.TEACHER) {
            return lessonRepository.findByTeacherAndActiveTrue(currentUser);
        }

        if (currentUser.getUserRole() == UserRole.STUDENT) {
            // Глобальні лекції (type = LECTURE) — однакові для всіх
            List<Lesson> globalLectures = lessonRepository.findAll().stream()
                    .filter(Lesson::isActive)
                    .filter(l -> "LECTURE".equalsIgnoreCase(l.getType()))
                    .toList();

            // Якщо у студента є тіма з проектом і вибраний lesson — показуємо тільки його + лекції
            Optional<ProjectReview> projectReview = teamService.getMyTeam(currentUser)
                    .flatMap(team -> projectRepository.findByTeam(team))
                    .flatMap(project -> projectReviewRepository.findByProject(project));

            if (projectReview.isPresent()) {
                Lesson selectedLesson = projectReview.get().getLesson();

                List<Lesson> result = new java.util.ArrayList<>();
                result.add(selectedLesson);
                // Додаємо глобальні лекції (якщо сам вибраний урок не є лекцією)
                globalLectures.stream()
                        .filter(l -> !l.getId().equals(selectedLesson.getId()))
                        .forEach(result::add);
                return result;
            }

            // Проекту ще немає — показуємо всі уроки свого вчителя + глобальні лекції
            List<Lesson> result = new java.util.ArrayList<>();
            if (currentUser.getTeacher() != null) {
                result.addAll(lessonRepository.findByTeacherAndActiveTrue(currentUser.getTeacher()));
            }
            globalLectures.stream()
                    .filter(l -> !result.contains(l))
                    .forEach(result::add);
            return result;
        }

        return lessonRepository.findAll().stream().filter(Lesson::isActive).toList();
    }

    public List<Lesson> getLessonsOfTeacher(User teacher) {
        return lessonRepository.findByTeacherAndActiveTrue(teacher);
    }

    public List<Lesson> getAllActiveLessons() {
        return lessonRepository.findAll().stream().filter(Lesson::isActive).toList();
    }
}
