package com.AIPM.AIPM_Back.task.dto;

import com.AIPM.AIPM_Back.task.entity.TaskEntity;
import lombok.Getter;

@Getter
public class TaskResponseDto {
    private final String uuid;
    private final String title;
    private final String description;
    private final String status;
    private final String priority;
    private final String dueDate;
    private final String createdBy;
    private final String assigneeUuid;
    private final String assigneeName;
    private final String projectUuid;

    public TaskResponseDto(TaskEntity task) {
        this.uuid = task.getUuid();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus().name();
        this.priority = task.getPriority().name();
        this.dueDate = task.getDueDate() != null ? task.getDueDate().toString() : null;
        this.createdBy = task.getCreatedBy().name();
        this.assigneeUuid = task.getAssignee() != null ? task.getAssignee().getUuid() : null;
        this.assigneeName = task.getAssigneeName() != null ? task.getAssigneeName()
                : (task.getAssignee() != null ? task.getAssignee().getName() : null);
        this.projectUuid = task.getProject() != null ? task.getProject().getUuid() : null;
    }
}
