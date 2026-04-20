package com.AIPM.AIPM_Back.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ProjectCreateDto {
    @NotBlank(message = "프로젝트명은 필수입니다.")
    private String name;
    private String description;
    @NotNull(message = "시작일은 필수입니다.")
    private String startDate;
    @NotNull(message = "종료일은 필수입니다.")
    private String endDate;
    private List<String> members;
}
