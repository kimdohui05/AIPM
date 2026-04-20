package com.AIPM.AIPM_Back.task.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TaskUpdateDto {
    private String title;
    private String description;
    private String assigneeName;
    private String priority;
    private String dueDate;
    private String status;
    private Integer progress;
}
