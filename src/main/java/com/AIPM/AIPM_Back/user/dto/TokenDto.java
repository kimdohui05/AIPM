package com.AIPM.AIPM_Back.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenDto {
    private String token;
    private String uuid;
    private String nickname;
}