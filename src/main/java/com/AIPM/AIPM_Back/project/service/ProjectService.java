package com.AIPM.AIPM_Back.project.service;

import com.AIPM.AIPM_Back.project.dto.ProjectCreateDto;
import com.AIPM.AIPM_Back.project.dto.ProjectResponseDto;
import com.AIPM.AIPM_Back.project.entity.ProjectEntity;
import com.AIPM.AIPM_Back.project.repository.ProjectRepository;
import com.AIPM.AIPM_Back.user.entity.UserEntity;
import com.AIPM.AIPM_Back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponseDto createProject(String creatorUuid, ProjectCreateDto dto) {
        UserEntity creator = userRepository.findByUuid(creatorUuid)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        ProjectEntity project = ProjectEntity.builder()
                .creator(creator)
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate() != null ? LocalDate.parse(dto.getStartDate()) : LocalDate.now())
                .endDate(dto.getEndDate() != null ? LocalDate.parse(dto.getEndDate()) : null)
                .status(ProjectEntity.ProjectStatus.IN_PROGRESS)
                .build();

        return new ProjectResponseDto(projectRepository.save(project));
    }

    public List<ProjectResponseDto> getMyProjects(String creatorUuid) {
        return projectRepository.findByCreator_Uuid(creatorUuid).stream()
                .map(ProjectResponseDto::new)
                .collect(Collectors.toList());
    }

    public ProjectResponseDto getProject(String projectUuid) {
        ProjectEntity project = projectRepository.findByUuid(projectUuid)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
        return new ProjectResponseDto(project);
    }

    @Transactional
    public ProjectResponseDto updateProject(String projectUuid, String creatorUuid, ProjectCreateDto dto) {
        ProjectEntity project = projectRepository.findByUuid(projectUuid)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        if (!project.getCreator().getUuid().equals(creatorUuid)) {
            throw new IllegalArgumentException("프로젝트 수정 권한이 없습니다.");
        }

        project.update(
                dto.getName(),
                dto.getDescription(),
                dto.getStartDate() != null ? LocalDate.parse(dto.getStartDate()) : null,
                dto.getEndDate() != null ? LocalDate.parse(dto.getEndDate()) : null
        );

        return new ProjectResponseDto(project);
    }

    @Transactional
    public void deleteProject(String projectUuid, String creatorUuid) {
        ProjectEntity project = projectRepository.findByUuid(projectUuid)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        if (!project.getCreator().getUuid().equals(creatorUuid)) {
            throw new IllegalArgumentException("프로젝트 삭제 권한이 없습니다.");
        }

        projectRepository.delete(project);
    }
}
