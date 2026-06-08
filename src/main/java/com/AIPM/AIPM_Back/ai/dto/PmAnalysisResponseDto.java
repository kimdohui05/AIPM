package com.AIPM.AIPM_Back.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PmAnalysisResponseDto {

    private List<InitialTaskDto> initialTasks;

    @Getter
    @Setter
    public static class InitialTaskDto {
        private String title;
        private String description;
    }
}