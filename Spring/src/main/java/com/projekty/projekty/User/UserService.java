package com.projekty.projekty.User;

import com.projekty.projekty.CustomException.UserNotFoundException;
import com.projekty.projekty.Team.TeamMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TeamMembershipService teamMembershipService;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    public List<User> getTeachers() {
        return userRepository.findAllTeachers();
    }

    public List<User> searchTeachers(String query) {
        return userRepository.searchTeachersByNameOrEmail(query);
    }

    public List<User> searchStudents(User currentUser, String query) {
        String q = (query == null) ? "" : query.trim();
        if (currentUser.getUserRole() == UserRole.TEACHER || (currentUser.getUserRole() == UserRole.ADMIN && currentUser.isTeacher())) {
            return userRepository.searchByRoleAndTeacherAndNameOrEmail(UserRole.STUDENT, currentUser, q);
        }
        if (currentUser.getTeacher() != null) {
            return userRepository.searchByRoleAndTeacherAndNameOrEmail(UserRole.STUDENT, currentUser.getTeacher(), q).stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .filter(u -> teamMembershipService.getTeamOfUser(u).isEmpty())
                    .toList();
        }
        return userRepository.searchByRoleAndNameOrEmail(UserRole.STUDENT, q).stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .filter(u -> teamMembershipService.getTeamOfUser(u).isEmpty())
                .toList();
    }

    public User createTeacher(String name, String email) {
        User teacher = User.builder()
                .name(name)
                .email(email)
                .userRole(UserRole.TEACHER)
                .isTeacher(true)
                .onboarded(true)
                .build();
        return userRepository.save(teacher);
    }

    public User updateUserRole(Long userId, UserRole role) {
        User user = getUserById(userId);
        user.setUserRole(role);
        if (role == UserRole.TEACHER) {
            user.setTeacher(null); // not a student, doesn't have a teacher
            user.setIsTeacher(true);
        }
        return userRepository.save(user);
    }

    public List<User> getAllStudents() {
        return userRepository.findByUserRole(UserRole.STUDENT);
    }

    public List<User> getStudentsOfTeacher(User teacher) {
        return userRepository.findByTeacherAndUserRole(teacher, UserRole.STUDENT);
    }

    public User completeOnboarding(User currentUser, String name, Long teacherId) {
        currentUser.setName(name);

        if (currentUser.getUserRole() == UserRole.STUDENT) {
            User teacher = getUserById(teacherId);
            currentUser.setTeacher(teacher);
        }

        currentUser.setOnboarded(true);
        return userRepository.save(currentUser);
    }

    public User updateUser(Long id, String name, String email, UserRole role, Boolean isTeacher) {
        User user = getUserById(id);
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        if (email != null && !email.isBlank()) {
            user.setEmail(email.trim().toLowerCase());
        }
        if (role != null) {
            user.setUserRole(role);
            if (role == UserRole.TEACHER) {
                user.setIsTeacher(true);
            }
        }
        if (isTeacher != null) {
            user.setIsTeacher(isTeacher);
        }
        return userRepository.save(user);
    }
}
