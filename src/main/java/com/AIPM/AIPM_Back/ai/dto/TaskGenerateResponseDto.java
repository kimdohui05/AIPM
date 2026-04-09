package com.AIPM.AIPM_Back.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TaskGenerateResponseDto {

    private List<TaskDto> tasks;

    @Getter
    @Setter
    public static class TaskDto {
        private String title;
        private String description;
        private String assignee;
        private String priority;
        private String dueDate;
    }
}