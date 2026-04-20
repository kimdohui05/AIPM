package com.AIPM.AIPM_Back.project.dto;

import com.AIPM.AIPM_Back.project.entity.ProjectEntity;
import lombok.Getter;

@Getter
public class ProjectResponseDto {
    private final String uuid;
    private final String name;
    private final String description;
    private final String startDate;
    private final String endDate;
    private final String status;
    private final String creatorUuid;
    private final String createdAt;

    public ProjectResponseDto(ProjectEntity project) {
        this.uuid = project.getUuid();
        this.name = project.getName();
        this.description = project.getDescription();
        this.startDate = project.getStartDate() != null ? project.getStartDate().toString() : null;
        this.endDate = project.getEndDate() != null ? project.getEndDate().toString() : null;
        this.status = project.getStatus().name();
        this.creatorUuid = project.getCreator() != null ? project.getCreator().getUuid() : null;
        this.createdAt = project.getCreatedAt() != null ? project.getCreatedAt().toString() : null;
    }
}
