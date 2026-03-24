package com.AIPM.AIPM_Back.token.service;

import com.AIPM.AIPM_Back.token.entity.TokenEntity;
import com.AIPM.AIPM_Back.token.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    @Transactional
    public void saveRefreshToken(String uuid, String refreshToken) {
        tokenRepository.findByUuid(uuid).ifPresent(tokenRepository::delete);

        TokenEntity token = TokenEntity.builder()
                .uuid(uuid)
                .refreshToken(refreshToken)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .build();

        tokenRepository.save(token);
    }

    @Transactional(readOnly = true)
    public boolean isRefreshTokenValid(String uuid, String refreshToken) {
        return tokenRepository.findByUuid(uuid)
                .filter(t -> t.getRefreshToken().equals(refreshToken))
                .filter(t -> !t.isExpired())
                .isPresent();
    }

    @Transactional
    public void deleteRefreshToken(String uuid) {
        tokenRepository.deleteByUuid(uuid);
    }
}