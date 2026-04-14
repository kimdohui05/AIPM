package com.AIPM.AIPM_Back.ai.controller;

import com.AIPM.AIPM_Back.ai.dto.PmAnalysisRequestDto;
import com.AIPM.AIPM_Back.ai.dto.PmAnalysisResponseDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateRequestDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateResponseDto;
import com.AIPM.AIPM_Back.ai.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/generate-tasks")
    public ResponseEntity<TaskGenerateResponseDto> generateTasks(
            @Valid @RequestBody TaskGenerateRequestDto request) {
        TaskGenerateResponseDto response = geminiService.generateTasks(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/pm-analysis")
    public ResponseEntity<PmAnalysisResponseDto> analyzePm(
            @Valid @RequestBody PmAnalysisRequestDto request) {
        PmAnalysisResponseDto response = geminiService.analyzePmInsights(request);
        return ResponseEntity.ok(response);
    }
}