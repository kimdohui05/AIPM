package com.AIPM.AIPM_Back.ai.controller;

import com.AIPM.AIPM_Back.ai.dto.PmAnalysisRequestDto;
import com.AIPM.AIPM_Back.ai.dto.PmAnalysisResponseDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateRequestDto;
import com.AIPM.AIPM_Back.ai.service.GeminiService;
import com.AIPM.AIPM_Back.task.dto.TaskResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/pm-analysis")
    public ResponseEntity<PmAnalysisResponseDto> analyzePm(
            @Valid @RequestBody PmAnalysisRequestDto request) {
        PmAnalysisResponseDto response = geminiService.analyzePmInsights(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-tasks")
    public ResponseEntity<List<TaskResponseDto>> generateTasks(
            @Valid @RequestBody TaskGenerateRequestDto request) {
        List<TaskResponseDto> tasks = geminiService.generateAndSaveTasks(request);
        return ResponseEntity.ok(tasks);
    }
}