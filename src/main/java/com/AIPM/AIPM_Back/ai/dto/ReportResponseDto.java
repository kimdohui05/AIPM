package com.AIPM.AIPM_Back.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReportResponseDto {

    private String summary;
    private List<SectionDto> sections;

    @Getter
    @Setter
    public static class SectionDto {
        private String title;
        private String content;
    }
}