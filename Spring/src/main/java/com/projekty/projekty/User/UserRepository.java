package com.projekty.projekty.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByUserRole(UserRole userRole);
    List<User> findByUserRoleAndNameContainingIgnoreCase(UserRole userRole, String name);

    @Query("SELECT u FROM User u WHERE u.userRole = com.projekty.projekty.User.UserRole.TEACHER OR (u.userRole = com.projekty.projekty.User.UserRole.ADMIN AND u.isTeacher = true)")
    List<User> findAllTeachers();

    @Query("SELECT u FROM User u WHERE (u.userRole = com.projekty.projekty.User.UserRole.TEACHER OR (u.userRole = com.projekty.projekty.User.UserRole.ADMIN AND u.isTeacher = true)) " +
            "AND (:query IS NULL OR :query = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchTeachersByNameOrEmail(@Param("query") String query);

    List<User> findByTeacherAndUserRole(User teacher, UserRole userRole);

    @Query("SELECT u FROM User u WHERE u.userRole = :role AND u.onboarded = true " +
            "AND (:query IS NULL OR :query = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchByRoleAndNameOrEmail(@Param("role") UserRole role, @Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.userRole = :role AND u.onboarded = true AND u.teacher = :teacher " +
            "AND (:query IS NULL OR :query = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchByRoleAndTeacherAndNameOrEmail(@Param("role") UserRole role, @Param("teacher") User teacher, @Param("query") String query);
}

