package com.projekty.projekty.Lesson;

import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserService;
import com.projekty.projekty.util.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final UserService userService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<LessonResponse> createLesson(@Valid @RequestBody CreateLessonRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Lesson lesson = lessonService.createLesson(
                currentUser, request.dayOfWeek(), request.hour(), request.endHour(), request.room(), request.teacherId(), request.type()
        );
        return ResponseEntity.ok(LessonResponse.from(lesson));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonResponse> updateLesson(@PathVariable Long id, @Valid @RequestBody CreateLessonRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Lesson lesson = lessonService.updateLesson(
                currentUser, id, request.dayOfWeek(), request.hour(), request.endHour(), request.room(), request.teacherId(), request.type()
        );
        return ResponseEntity.ok(LessonResponse.from(lesson));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        lessonService.deleteLesson(currentUser, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<LessonResponse>> getMyLessons() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<LessonResponse> response = lessonService.getMyLessons(currentUser).stream()
                .map(LessonResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<LessonResponse>> getAllLessons() {
        List<LessonResponse> response = lessonService.getAllActiveLessons().stream()
                .map(LessonResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    // расписание конкретного учителя - нужно студентам при создании проекта, чтобы выбрать слот
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<LessonResponse>> getLessonsOfTeacher(@PathVariable Long teacherId) {
        User teacher = userService.getUserById(teacherId);
        List<LessonResponse> response = lessonService.getLessonsOfTeacher(teacher).stream()
                .map(LessonResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }
}
