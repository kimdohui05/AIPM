package com.AIPM.AIPM_Back.task.repository;

import com.AIPM.AIPM_Back.task.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

    List<TaskEntity> findByProject_Uuid(String projectUuid);

    List<TaskEntity> findByAssignee_Uuid(String userUuid);

    List<TaskEntity> findByProject_UuidAndAssignee_Uuid(String projectUuid, String userUuid);
}
