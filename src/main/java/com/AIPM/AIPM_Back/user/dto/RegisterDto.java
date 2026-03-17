package com.AIPM.AIPM_Back.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RegisterDto {
    private String email;
    private String password;
    private String nickname;
}