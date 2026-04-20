package com.AIPM.AIPM_Back.task.controller;

import com.AIPM.AIPM_Back.task.dto.TaskCreateDto;
import com.AIPM.AIPM_Back.task.dto.TaskResponseDto;
import com.AIPM.AIPM_Back.task.dto.TaskUpdateDto;
import com.AIPM.AIPM_Back.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/project/{projectUuid}")
    public ResponseEntity<List<TaskResponseDto>> getTasks(@PathVariable String projectUuid) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectUuid));
    }

    @PostMapping("/project/{projectUuid}")
    public ResponseEntity<TaskResponseDto> createTask(
            @PathVariable String projectUuid,
            @RequestBody TaskCreateDto dto) {
        return ResponseEntity.ok(taskService.createTask(projectUuid, dto));
    }

    @GetMapping("/{taskUuid}")
    public ResponseEntity<TaskResponseDto> getTask(@PathVariable String taskUuid) {
        return ResponseEntity.ok(taskService.getTask(taskUuid));
    }

    @PatchMapping("/{taskUuid}")
    public ResponseEntity<TaskResponseDto> updateTask(
            @PathVariable String taskUuid,
            @RequestBody TaskUpdateDto dto) {
        return ResponseEntity.ok(taskService.updateTask(taskUuid, dto));
    }

    @DeleteMapping("/{taskUuid}")
    public ResponseEntity<Void> deleteTask(@PathVariable String taskUuid) {
        taskService.deleteTask(taskUuid);
        return ResponseEntity.noContent().build();
    }
}
