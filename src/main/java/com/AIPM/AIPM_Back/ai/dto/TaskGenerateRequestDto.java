package com.AIPM.AIPM_Back.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TaskGenerateRequestDto {

    private String projectName;
    private String projectDescription;
    private String startDate;
    private String endDate;
    private List<MemberInfoDto> members;

    @Getter
    @Setter
    public static class MemberInfoDto {
        private String name;
        private String position;
        private String portfolio;
    }
}