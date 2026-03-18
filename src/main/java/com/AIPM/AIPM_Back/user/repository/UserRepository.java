package com.AIPM.AIPM_Back.user.repository;

import com.AIPM.AIPM_Back.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);

    Optional<User> findByUserId(String userId); // 아이디로 로그인용

    Optional<User> findByUuid(String uuid);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}