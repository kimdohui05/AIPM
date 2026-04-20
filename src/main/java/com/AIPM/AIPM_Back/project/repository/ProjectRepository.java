package com.AIPM.AIPM_Back.project.repository;

import com.AIPM.AIPM_Back.project.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    Optional<ProjectEntity> findByUuid(String uuid);

    List<ProjectEntity> findByCreator_Uuid(String creatorUuid);
}
