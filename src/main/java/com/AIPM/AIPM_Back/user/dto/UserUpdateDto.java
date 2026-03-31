package com.AIPM.AIPM_Back.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserUpdateDto {
    private String name;
    private String nickname;
    private String profileImage;
    private String organizationId;
    private String departmentId;
    private String position;
    private String portfolio;
}