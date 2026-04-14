package com.AIPM.AIPM_Back.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PmAnalysisResponseDto {

    /** 태스크별 소요일 예측 */
    private List<TaskEstimateDto> taskEstimates;

    /** 전체 프로젝트 완료 예상일 (YYYY-MM-DD) */
    private String projectEstimatedCompletionDate;

    /** 리스크 경고 목록 */
    private List<RiskWarningDto> riskWarnings;

    /** 우선순위 재조정 순서 (1위부터 정렬) */
    private List<PrioritizedTaskDto> prioritizedTasks;

    @Getter
    @Setter
    public static class TaskEstimateDto {
        private String taskUuid;
        private String taskTitle;
        private String assignee;
        /** 예상 소요일 */
        private Integer estimatedDays;
        /** 예상 완료일 (YYYY-MM-DD) */
        private String estimatedCompletionDate;
        /** 예측 근거 한 줄 요약 */
        private String reason;
    }

    @Getter
    @Setter
    public static class RiskWarningDto {
        /** DEADLINE / BOTTLENECK / DEPENDENCY / OVERLOAD */
        private String type;
        /** HIGH / MEDIUM / LOW */
        private String severity;
        /** 경고 메시지 */
        private String message;
        /** 관련 태스크 UUID (없으면 null) */
        private String relatedTaskUuid;
        /** 관련 팀원 이름 (없으면 null) */
        private String relatedMember;
    }

    @Getter
    @Setter
    public static class PrioritizedTaskDto {
        private int rank;
        private String taskUuid;
        private String taskTitle;
        private String assignee;
        /** 이 순서로 처리해야 하는 이유 */
        private String reason;
    }
}
