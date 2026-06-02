package com.AIPM.AIPM_Back.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReportRequestDto {

    @NotBlank(message = "프로젝트명은 필수입니다.")
    private String projectName;

    @NotBlank(message = "시작일은 필수입니다.")
    private String startDate;

    @NotBlank(message = "마감일은 필수입니다.")
    private String endDate;

    @NotEmpty(message = "태스크 목록은 필수입니다.")
    @Valid
    private List<TaskDto> tasks;

    @Getter
    @Setter
    public static class TaskDto {

        @NotBlank(message = "태스크 제목은 필수입니다.")
        private String title;

        private String description;

        /** PLANNED / IN_PROGRESS / COMPLETED */
        @NotBlank(message = "태스크 상태는 필수입니다.")
        private String status;

        /** HIGH / MEDIUM / LOW */
        private String priority;

        private String assignee;

        private String dueDate;
    }
}