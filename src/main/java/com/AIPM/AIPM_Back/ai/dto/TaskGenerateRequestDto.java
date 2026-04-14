package com.AIPM.AIPM_Back.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TaskGenerateRequestDto {

    @NotBlank(message = "프로젝트명은 필수입니다.")
    private String projectName;

    @NotBlank(message = "프로젝트 설명은 필수입니다.")
    private String projectDescription;

    @NotBlank(message = "시작일은 필수입니다.")
    private String startDate;

    @NotBlank(message = "마감일은 필수입니다.")
    private String endDate;

    @NotEmpty(message = "팀원 목록은 필수입니다.")
    @Valid
    private List<MemberInfoDto> members;

    @Getter
    @Setter
    public static class MemberInfoDto {

        @NotBlank(message = "팀원 이름은 필수입니다.")
        private String name;

        @NotBlank(message = "팀원 직급은 필수입니다.")
        private String position;

        private String portfolio;
    }
}