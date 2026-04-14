package com.AIPM.AIPM_Back.user.controller;

import com.AIPM.AIPM_Back.user.dto.LoginDto;
import com.AIPM.AIPM_Back.user.dto.RegisterDto;
import com.AIPM.AIPM_Back.user.dto.UserProfileDto;
import com.AIPM.AIPM_Back.user.dto.UserUpdateDto;
import com.AIPM.AIPM_Back.token.dto.TokenDto;
import com.AIPM.AIPM_Back.token.service.TokenService;
import com.AIPM.AIPM_Back.jwt.JwtUtil;
import com.AIPM.AIPM_Back.user.entity.UserEntity;
import com.AIPM.AIPM_Back.user.repository.UserRepository;
import com.AIPM.AIPM_Back.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDto request) {
        userService.signup(request);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody LoginDto request) {
        TokenDto token = userService.login(request);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenDto> refresh(@RequestHeader("Refresh-Token") String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            return ResponseEntity.status(401).build();
        }

        String uuid = jwtUtil.getSubject(refreshToken);

        if (!tokenService.isRefreshTokenValid(uuid, refreshToken)) {
            return ResponseEntity.status(401).build();
        }

        UserEntity user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        String newAccessToken = jwtUtil.generateToken(user.getEmail(), uuid);
        String newRefreshToken = jwtUtil.generateRefreshToken(uuid);

        tokenService.saveRefreshToken(uuid, newRefreshToken);

        return ResponseEntity.ok(new TokenDto(newAccessToken, newRefreshToken, uuid, user.getNickname()));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authHeader.substring(7);
        String uuid = jwtUtil.getUuid(token);
        return ResponseEntity.ok(userService.getProfile(uuid));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserUpdateDto request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authHeader.substring(7);
        String uuid = jwtUtil.getUuid(token);
        return ResponseEntity.ok(userService.updateProfile(uuid, request));
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("인증 성공");
    }
}