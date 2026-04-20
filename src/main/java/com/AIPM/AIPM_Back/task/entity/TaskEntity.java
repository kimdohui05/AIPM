package com.AIPM.AIPM_Back.task.entity;

import com.AIPM.AIPM_Back.project.entity.ProjectEntity;
import com.AIPM.AIPM_Back.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(nullable = false, unique = true, updatable = false)
    private String uuid = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity assignee;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority;

    private LocalDate dueDate;

    private String assigneeName;

    private Integer progress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreatedBy createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public void update(String title, String description, String assigneeName,
                       TaskPriority priority, LocalDate dueDate, TaskStatus status, Integer progress) {
        this.title = title;
        this.description = description;
        this.assigneeName = assigneeName;
        this.priority = priority;
        this.dueDate = dueDate;
        this.status = status;
        this.progress = progress;
    }

    public void update(TaskStatus status, TaskPriority priority, LocalDate dueDate, String description) {
        if (status != null) this.status = status;
        if (priority != null) this.priority = priority;
        if (dueDate != null) this.dueDate = dueDate;
        if (description != null) this.description = description;
    }

    public enum TaskStatus {
        PLANNED, IN_PROGRESS, COMPLETED
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH
    }

    public enum CreatedBy {
        AI, HUMAN
    }
}