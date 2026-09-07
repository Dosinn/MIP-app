package com.projekty.projekty.Auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginOtpRepository extends JpaRepository<LoginOtp, Long> {
    Optional<LoginOtp> findTopByEmailAndCodeOrderByCreatedAtDesc(String email, String code);
}
