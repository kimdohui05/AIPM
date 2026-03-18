package com.AIPM.AIPM_Back.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RegisterDto {
    private String userId;       // 로그인 아이디
    private String password;     // 비밀번호
    private String email;        // 이메일
    private String name;         // 실명
    private String nickname;     // 닉네임
    private String profileImage; // 프로필 사진
}