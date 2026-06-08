package com.AIPM.AIPM_Back.ai.service;

import com.AIPM.AIPM_Back.ai.dto.PmAnalysisRequestDto;
import com.AIPM.AIPM_Back.ai.dto.PmAnalysisResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService() {
        this.webClient = WebClient.create();
    }

    public PmAnalysisResponseDto analyzePmInsights(PmAnalysisRequestDto request) {
        String prompt = buildPmPrompt(request);

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        String response = webClient.post()
                .uri(apiUrl)
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .map(errorBody -> new RuntimeException(
                                        "Gemini API 오류 (" + clientResponse.statusCode() + "): " + errorBody)))
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(60))
                .block();

        if (response == null || response.isBlank()) {
            throw new RuntimeException("Gemini API로부터 빈 응답을 받았습니다.");
        }

        return parsePmResponse(response);
    }

    private String buildPmPrompt(PmAnalysisRequestDto request) {
        StringBuilder sb = new StringBuilder();

        sb.append("당신은 10년 경력의 시니어 프로젝트 매니저입니다.\n");
        sb.append("아래 프로젝트 정보를 바탕으로 프로젝트 초반에 반드시 해야 할 작업 목록을 추천하세요.\n\n");

        sb.append("=== 프로젝트 정보 ===\n");
        sb.append("프로젝트명: ").append(request.getProjectName()).append("\n");
        sb.append("시작일: ").append(request.getStartDate()).append("\n");
        sb.append("마감일: ").append(request.getEndDate()).append("\n\n");

        sb.append("=== 팀원 목록 ===\n");
        for (PmAnalysisRequestDto.MemberDto m : request.getMembers()) {
            sb.append("- 이름: ").append(m.getName())
                    .append(" | 직급: ").append(m.getPosition());
            sb.append("\n");
        }
        sb.append("\n");

        sb.append("=== 지시사항 ===\n");
        sb.append("프로젝트 초반(1~2주차)에 팀이 반드시 완료해야 할 셋업 및 준비 작업 5~8개를 추천하세요.\n");
        sb.append("예: 개발 환경 세팅, 협업 도구 설정, 브랜치 전략 수립 등\n");
        sb.append("프로젝트 성격과 팀 구성을 고려하여 실질적으로 도움이 되는 작업을 추천하세요.\n\n");

        sb.append("=== 출력 형식 ===\n");
        sb.append("반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.\n\n");
        sb.append("{\n");
        sb.append("  \"initialTasks\": [\n");
        sb.append("    {\n");
        sb.append("      \"title\": \"작업 제목\",\n");
        sb.append("      \"description\": \"작업 상세 설명\"\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");

        return sb.toString();
    }

    private PmAnalysisResponseDto parsePmResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String text = root
                    .path("candidates").path(0)
                    .path("content")
                    .path("parts").path(0)
                    .path("text")
                    .asText();

            if (text.isBlank()) {
                throw new RuntimeException("Gemini 응답에서 텍스트를 찾을 수 없습니다: " + response);
            }

            text = text.replaceAll("```json", "").replaceAll("```", "").trim();

            return objectMapper.readValue(text, PmAnalysisResponseDto.class);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("PM 분석 응답 파싱 실패: " + e.getMessage());
        }
    }
}

