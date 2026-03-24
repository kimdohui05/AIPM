package com.AIPM.AIPM_Back.token.repository;

import com.AIPM.AIPM_Back.token.entity.TokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<TokenEntity, Long> {
    Optional<TokenEntity> findByUuid(String uuid);
    void deleteByUuid(String uuid);
}