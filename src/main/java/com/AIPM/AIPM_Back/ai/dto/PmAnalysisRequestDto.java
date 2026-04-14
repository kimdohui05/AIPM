package com.AIPM.AIPM_Back.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PmAnalysisRequestDto {

    @NotBlank(message = "프로젝트명은 필수입니다.")
    private String projectName;

    @NotBlank(message = "시작일은 필수입니다.")
    private String startDate;

    @NotBlank(message = "마감일은 필수입니다.")
    private String endDate;

    @NotEmpty(message = "팀원 목록은 필수입니다.")
    @Valid
    private List<MemberDto> members;

    @NotEmpty(message = "태스크 목록은 필수입니다.")
    @Valid
    private List<TaskDto> tasks;

    @Getter
    @Setter
    public static class MemberDto {

        @NotBlank(message = "팀원 이름은 필수입니다.")
        private String name;

        @NotBlank(message = "팀원 직급은 필수입니다.")
        private String position;

        /** 기술 스택 (예: "Java, Spring Boot, React") */
        private String techStack;

        /** 경력 연수 */
        private Integer yearsOfExperience;

        /** 포트폴리오 요약 */
        private String portfolio;
    }

    @Getter
    @Setter
    public static class TaskDto {

        @NotBlank(message = "태스크 UUID는 필수입니다.")
        private String taskUuid;

        @NotBlank(message = "태스크 제목은 필수입니다.")
        private String title;

        private String description;

        /** PLANNED / IN_PROGRESS / COMPLETED */
        @NotBlank(message = "태스크 상태는 필수입니다.")
        private String status;

        /** HIGH / MEDIUM / LOW */
        private String priority;

        /** 담당자 이름 */
        private String assignee;

        private String dueDate;
    }
}
