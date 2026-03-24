package com.AIPM.AIPM_Back.user.service;

import com.AIPM.AIPM_Back.jwt.JwtUtil;
import com.AIPM.AIPM_Back.user.dto.LoginDto;
import com.AIPM.AIPM_Back.user.dto.RegisterDto;
import com.AIPM.AIPM_Back.token.dto.TokenDto;
import com.AIPM.AIPM_Back.token.service.TokenService;
import com.AIPM.AIPM_Back.user.entity.User;
import com.AIPM.AIPM_Back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenService tokenService;

    public void signup(RegisterDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }
        if (userRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
        }

        User user = User.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .nickname(request.getNickname())
                .profileImage(request.getProfileImage())
                .build();

        userRepository.save(user);
    }

    public TokenDto login(LoginDto request) {
        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getUuid());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUuid());

        tokenService.saveRefreshToken(user.getUuid(), refreshToken);

        return new TokenDto(accessToken, refreshToken, user.getUuid(), user.getNickname());
    }
}