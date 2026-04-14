package com.AIPM.AIPM_Back.ai.service;

import com.AIPM.AIPM_Back.ai.dto.TaskGenerateRequestDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TaskGenerateResponseDto generateTasks(TaskGenerateRequestDto request) {
        String prompt = buildPrompt(request);

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
                .timeout(Duration.ofSeconds(30))
                .block();

        if (response == null || response.isBlank()) {
            throw new RuntimeException("Gemini API로부터 빈 응답을 받았습니다.");
        }

        return parseResponse(response);
    }

    private String buildPrompt(TaskGenerateRequestDto request) {
        if (request.getMembers() == null || request.getMembers().isEmpty()) {
            throw new IllegalArgumentException("팀원 목록이 비어있습니다.");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("당신은 프로젝트 매니저입니다. 아래 프로젝트 정보와 팀원 정보를 바탕으로 태스크를 분배해주세요.\n\n");
        sb.append("프로젝트명: ").append(request.getProjectName()).append("\n");
        sb.append("프로젝트 설명: ").append(request.getProjectDescription()).append("\n");
        sb.append("시작일: ").append(request.getStartDate()).append("\n");
        sb.append("마감일: ").append(request.getEndDate()).append("\n\n");
        sb.append("팀원 목록:\n");

        for (TaskGenerateRequestDto.MemberInfoDto member : request.getMembers()) {
            String portfolio = member.getPortfolio() != null ? member.getPortfolio() : "없음";
            sb.append("- 이름: ").append(member.getName())
                    .append(", 직급: ").append(member.getPosition())
                    .append(", 포트폴리오: ").append(portfolio).append("\n");
        }

        sb.append("\n반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:\n");
        sb.append("{\n");
        sb.append("  \"tasks\": [\n");
        sb.append("    {\n");
        sb.append("      \"title\": \"태스크명\",\n");
        sb.append("      \"description\": \"태스크 설명\",\n");
        sb.append("      \"assignee\": \"담당자 이름\",\n");
        sb.append("      \"priority\": \"HIGH or MEDIUM or LOW\",\n");
        sb.append("      \"dueDate\": \"YYYY-MM-DD\"\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");

        return sb.toString();
    }

    private TaskGenerateResponseDto parseResponse(String response) {
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

            // ```json 코드블록 제거
            text = text.replaceAll("```json", "").replaceAll("```", "").trim();

            return objectMapper.readValue(text, TaskGenerateResponseDto.class);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Gemini 응답 파싱 실패: " + e.getMessage());
        }
    }
}