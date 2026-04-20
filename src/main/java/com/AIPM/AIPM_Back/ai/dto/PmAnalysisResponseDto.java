package com.AIPM.AIPM_Back.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PmAnalysisResponseDto {

    private List<RiskWarningDto> riskWarnings;

    @Getter
    @Setter
    public static class RiskWarningDto {
        private String type;
        private String severity;
        private String message;
        private String relatedTaskUuid;
        private String relatedMember;
    }
}
