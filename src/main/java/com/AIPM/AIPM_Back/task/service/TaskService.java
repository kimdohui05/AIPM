package com.AIPM.AIPM_Back.task.service;

import com.AIPM.AIPM_Back.project.entity.ProjectEntity;
import com.AIPM.AIPM_Back.project.repository.ProjectRepository;
import com.AIPM.AIPM_Back.task.dto.TaskCreateDto;
import com.AIPM.AIPM_Back.task.dto.TaskResponseDto;
import com.AIPM.AIPM_Back.task.dto.TaskUpdateDto;
import com.AIPM.AIPM_Back.task.entity.TaskEntity;
import com.AIPM.AIPM_Back.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public List<TaskResponseDto> getTasksByProject(String projectUuid) {
        return taskRepository.findByProject_Uuid(projectUuid).stream()
                .map(TaskResponseDto::new)
                .collect(Collectors.toList());
    }

    public TaskResponseDto getTask(String taskUuid) {
        TaskEntity task = taskRepository.findByUuid(taskUuid)
                .orElseThrow(() -> new IllegalArgumentException("태스크를 찾을 수 없습니다."));
        return new TaskResponseDto(task);
    }

    @Transactional
    public TaskResponseDto createTask(String projectUuid, TaskCreateDto dto) {
        ProjectEntity project = projectRepository.findByUuid(projectUuid)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        TaskEntity task = TaskEntity.builder()
                .project(project)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .assigneeName(dto.getAssigneeName())
                .priority(parsePriority(dto.getPriority()))
                .dueDate(dto.getDueDate() != null ? LocalDate.parse(dto.getDueDate()) : null)
                .status(TaskEntity.TaskStatus.PLANNED)
                .progress(0)
                .createdBy(TaskEntity.CreatedBy.HUMAN)
                .build();

        return new TaskResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto updateTask(String taskUuid, TaskUpdateDto dto) {
        TaskEntity task = taskRepository.findByUuid(taskUuid)
                .orElseThrow(() -> new IllegalArgumentException("태스크를 찾을 수 없습니다."));

        task.update(
                dto.getTitle() != null ? dto.getTitle() : task.getTitle(),
                dto.getDescription() != null ? dto.getDescription() : task.getDescription(),
                dto.getAssigneeName() != null ? dto.getAssigneeName() : task.getAssigneeName(),
                dto.getPriority() != null ? parsePriority(dto.getPriority()) : task.getPriority(),
                dto.getDueDate() != null ? LocalDate.parse(dto.getDueDate()) : task.getDueDate(),
                dto.getStatus() != null ? parseStatus(dto.getStatus()) : task.getStatus(),
                dto.getProgress() != null ? dto.getProgress() : task.getProgress()
        );

        return new TaskResponseDto(task);
    }

    @Transactional
    public void deleteTask(String taskUuid) {
        TaskEntity task = taskRepository.findByUuid(taskUuid)
                .orElseThrow(() -> new IllegalArgumentException("태스크를 찾을 수 없습니다."));
        taskRepository.delete(task);
    }

    private TaskEntity.TaskPriority parsePriority(String priority) {
        if (priority == null) return TaskEntity.TaskPriority.MEDIUM;
        return switch (priority.toUpperCase()) {
            case "HIGH", "높음" -> TaskEntity.TaskPriority.HIGH;
            case "LOW", "낮음" -> TaskEntity.TaskPriority.LOW;
            default -> TaskEntity.TaskPriority.MEDIUM;
        };
    }

    private TaskEntity.TaskStatus parseStatus(String status) {
        if (status == null) return TaskEntity.TaskStatus.PLANNED;
        return switch (status.toUpperCase()) {
            case "IN_PROGRESS", "IN-PROGRESS" -> TaskEntity.TaskStatus.IN_PROGRESS;
            case "COMPLETED", "DONE" -> TaskEntity.TaskStatus.COMPLETED;
            default -> TaskEntity.TaskStatus.PLANNED;
        };
    }
}
