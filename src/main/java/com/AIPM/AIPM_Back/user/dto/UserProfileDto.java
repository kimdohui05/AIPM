package com.AIPM.AIPM_Back.user.dto;

import com.AIPM.AIPM_Back.user.entity.User;
import lombok.Getter;

@Getter
public class UserProfileDto {
    private final String uuid;
    private final String userId;
    private final String name;
    private final String nickname;
    private final String email;
    private final String profileImage;
    private final String organizationId;
    private final String departmentId;
    private final Long teamId;
    private final String position;
    private final String portfolio;

    public UserProfileDto(User user) {
        this.uuid = user.getUuid();
        this.userId = user.getUserId();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
        this.profileImage = user.getProfileImage();
        this.organizationId = user.getOrganizationId();
        this.departmentId = user.getDepartmentId();
        this.teamId = user.getTeamId();
        this.position = user.getPosition();
        this.portfolio = user.getPortfolio();
    }
}