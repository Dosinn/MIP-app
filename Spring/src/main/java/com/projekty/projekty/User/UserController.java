package com.projekty.projekty.User;

import com.projekty.projekty.Lesson.LessonService;
import com.projekty.projekty.Lesson.TeacherLessonResponse;
import com.projekty.projekty.util.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final CurrentUserProvider currentUserProvider;
    private final UserService userService;
    private final LessonService lessonService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(UserResponse.from(currentUserProvider.getCurrentUser()));
    }

    @PatchMapping("/me/onboarding")
    public ResponseEntity<UserResponse> completeOnboarding(@Valid @RequestBody OnboardingRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        User updated = userService.completeOnboarding(currentUser, request.name(), request.teacherId());
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherResponse>> getTeachers(@RequestParam(required = false) String search) {
        List<User> teachers = (search != null && !search.isBlank())
                ? userService.searchTeachers(search)
                : userService.getTeachers();

        List<TeacherResponse> response = teachers.stream()
                .map(teacher -> {
                    List<TeacherLessonResponse> lessons = lessonService.getLessonsOfTeacher(teacher).stream()
                            .map(TeacherLessonResponse::from)
                            .toList();
                    return TeacherResponse.from(teacher, lessons);
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/students")
    public ResponseEntity<List<UserResponse>> searchStudents(@RequestParam(required = false, defaultValue = "") String search) {
        User currentUser = currentUserProvider.getCurrentUser();
        List<UserResponse> response = userService.searchStudents(currentUser, search).stream()
                .map(UserResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/students/all")
    public ResponseEntity<List<UserResponse>> getAllStudents() {
        List<UserResponse> response = userService.getAllStudents().stream()
                .map(UserResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/teachers")
    public ResponseEntity<UserResponse> createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        User teacher = userService.createTeacher(request.name(), request.email());
        return ResponseEntity.ok(UserResponse.from(teacher));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable Long id, @RequestBody UpdateRoleRequest request) {
        UserRole role = UserRole.valueOf(request.role().toUpperCase());
        User updated = userService.updateUserRole(id, role);
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        UserRole role = request.role() != null && !request.role().isBlank()
                ? UserRole.valueOf(request.role().toUpperCase())
                : null;
        User updated = userService.updateUser(id, request.name(), request.email(), role, request.isTeacher());
        return ResponseEntity.ok(UserResponse.from(updated));
    }
}

