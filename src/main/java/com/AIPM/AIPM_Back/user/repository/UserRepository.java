package com.AIPM.AIPM_Back.user.repository;

import com.AIPM.AIPM_Back.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);

    Optional<UserEntity> findByUserId(String userId); // 아이디로 로그인용

    Optional<UserEntity> findByUuid(String uuid);

    Optional<UserEntity> findByProviderAndProviderId(String provider, String providerId);
}