package com.AIPM.AIPM_Back.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginDto {
    private String userId;
    private String password;
}