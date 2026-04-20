package com.AIPM.AIPM_Back.project.controller;

import com.AIPM.AIPM_Back.jwt.JwtUtil;
import com.AIPM.AIPM_Back.project.dto.ProjectCreateDto;
import com.AIPM.AIPM_Back.project.dto.ProjectResponseDto;
import com.AIPM.AIPM_Back.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ProjectResponseDto> createProject(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProjectCreateDto dto) {
        String uuid = jwtUtil.getUuid(authHeader.substring(7));
        return ResponseEntity.ok(projectService.createProject(uuid, dto));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponseDto>> getMyProjects(
            @RequestHeader("Authorization") String authHeader) {
        String uuid = jwtUtil.getUuid(authHeader.substring(7));
        return ResponseEntity.ok(projectService.getMyProjects(uuid));
    }

    @GetMapping("/{projectUuid}")
    public ResponseEntity<ProjectResponseDto> getProject(@PathVariable String projectUuid) {
        return ResponseEntity.ok(projectService.getProject(projectUuid));
    }

    @PutMapping("/{projectUuid}")
    public ResponseEntity<ProjectResponseDto> updateProject(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String projectUuid,
            @RequestBody ProjectCreateDto dto) {
        String uuid = jwtUtil.getUuid(authHeader.substring(7));
        return ResponseEntity.ok(projectService.updateProject(projectUuid, uuid, dto));
    }

    @DeleteMapping("/{projectUuid}")
    public ResponseEntity<Void> deleteProject(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String projectUuid) {
        String uuid = jwtUtil.getUuid(authHeader.substring(7));
        projectService.deleteProject(projectUuid, uuid);
        return ResponseEntity.noContent().build();
    }
}
