package com.AIPM.AIPM_Back.ai.service;

import com.AIPM.AIPM_Back.ai.dto.PmAnalysisRequestDto;
import com.AIPM.AIPM_Back.ai.dto.PmAnalysisResponseDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateRequestDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateResponseDto;
import com.AIPM.AIPM_Back.project.entity.ProjectEntity;
import com.AIPM.AIPM_Back.project.repository.ProjectRepository;
import com.AIPM.AIPM_Back.task.dto.TaskResponseDto;
import com.AIPM.AIPM_Back.task.entity.TaskEntity;
import com.AIPM.AIPM_Back.task.repository.TaskRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
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

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

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
        sb.append("아래 프로젝트 정보, 팀원 포트폴리오, 현재 태스크 진행 상황을 분석하여\n");
        sb.append("리스크 경고를 도출하세요.\n\n");

        sb.append("=== 프로젝트 정보 ===\n");
        sb.append("프로젝트명: ").append(request.getProjectName()).append("\n");
        sb.append("시작일: ").append(request.getStartDate()).append("\n");
        sb.append("마감일: ").append(request.getEndDate()).append("\n\n");

        sb.append("=== 팀원 포트폴리오 ===\n");
        for (PmAnalysisRequestDto.MemberDto m : request.getMembers()) {
            sb.append("- 이름: ").append(m.getName())
              .append(" | 직급: ").append(m.getPosition());
            if (m.getYearsOfExperience() != null) {
                sb.append(" | 경력: ").append(m.getYearsOfExperience()).append("년");
            }
            if (m.getTechStack() != null && !m.getTechStack().isBlank()) {
                sb.append(" | 기술스택: ").append(m.getTechStack());
            }
            if (m.getPortfolio() != null && !m.getPortfolio().isBlank()) {
                sb.append(" | 포트폴리오: ").append(m.getPortfolio());
            }
            sb.append("\n");
        }
        sb.append("\n");

        sb.append("=== 현재 태스크 목록 ===\n");
        for (PmAnalysisRequestDto.TaskDto t : request.getTasks()) {
            sb.append("- UUID: ").append(t.getTaskUuid())
              .append(" | 제목: ").append(t.getTitle())
              .append(" | 상태: ").append(t.getStatus())
              .append(" | 우선순위: ").append(t.getPriority() != null ? t.getPriority() : "미지정")
              .append(" | 담당자: ").append(t.getAssignee() != null ? t.getAssignee() : "미배정")
              .append(" | 마감일: ").append(t.getDueDate() != null ? t.getDueDate() : "미지정");
            if (t.getDescription() != null && !t.getDescription().isBlank()) {
                sb.append(" | 설명: ").append(t.getDescription());
            }
            sb.append("\n");
        }
        sb.append("\n");

        sb.append("=== 분석 지시사항 ===\n");
        sb.append("다음 유형의 리스크를 탐지하세요:\n");
        sb.append("   - DEADLINE: 마감일 기준으로 늦춰질 가능성이 있는 태스크\n");
        sb.append("   - OVERLOAD: 특정 팀원에게 업무가 집중되어 병목이 예상되는 경우\n");
        sb.append("   - BOTTLENECK: 다른 태스크의 선행 조건이 되는 태스크가 지연되는 경우\n");
        sb.append("   - DEPENDENCY: 담당자 미배정으로 진행이 막힌 태스크\n\n");

        sb.append("=== 출력 형식 ===\n");
        sb.append("반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.\n");
        sb.append("taskUuid는 입력에서 받은 값을 그대로 사용하세요.\n\n");
        sb.append("{\n");
        sb.append("  \"riskWarnings\": [\n");
        sb.append("    {\n");
        sb.append("      \"type\": \"DEADLINE\",\n");
        sb.append("      \"severity\": \"HIGH\",\n");
        sb.append("      \"message\": \"구체적인 경고 메시지\",\n");
        sb.append("      \"relatedTaskUuid\": \"태스크 UUID 또는 null\",\n");
        sb.append("      \"relatedMember\": \"팀원 이름 또는 null\"\n");
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

    @Transactional
    public List<TaskResponseDto> generateAndSaveTasks(TaskGenerateRequestDto request) {
        ProjectEntity project = projectRepository.findByUuid(request.getProjectUuid())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        String prompt = buildTaskGeneratePrompt(request);

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

        TaskGenerateResponseDto dto = parseTaskGenerateResponse(response);
        List<TaskResponseDto> saved = new ArrayList<>();

        for (TaskGenerateResponseDto.TaskDto t : dto.getTasks()) {
            TaskEntity.TaskPriority priority;
            try {
                priority = TaskEntity.TaskPriority.valueOf(
                        t.getPriority() != null ? t.getPriority().toUpperCase() : "MEDIUM");
            } catch (IllegalArgumentException e) {
                priority = TaskEntity.TaskPriority.MEDIUM;
            }

            LocalDate dueDate = null;
            if (t.getDueDate() != null && !t.getDueDate().isBlank()) {
                try { dueDate = LocalDate.parse(t.getDueDate()); } catch (Exception ignored) {}
            }

            TaskEntity task = TaskEntity.builder()
                    .project(project)
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .assigneeName(t.getAssignee())
                    .priority(priority)
                    .dueDate(dueDate)
                    .status(TaskEntity.TaskStatus.PLANNED)
                    .progress(0)
                    .createdBy(TaskEntity.CreatedBy.AI)
                    .build();

            saved.add(new TaskResponseDto(taskRepository.save(task)));
        }

        return saved;
    }

    private String buildTaskGeneratePrompt(TaskGenerateRequestDto request) {
        StringBuilder sb = new StringBuilder();

        sb.append("당신은 10년 경력의 시니어 프로젝트 매니저입니다.\n");
        sb.append("아래 프로젝트 정보와 팀원 목록을 바탕으로 태스크 목록을 생성하세요.\n\n");

        sb.append("=== 프로젝트 정보 ===\n");
        sb.append("프로젝트명: ").append(request.getProjectName()).append("\n");
        sb.append("설명: ").append(request.getProjectDescription()).append("\n");
        sb.append("시작일: ").append(request.getStartDate()).append("\n");
        sb.append("마감일: ").append(request.getEndDate()).append("\n\n");

        sb.append("=== 팀원 목록 ===\n");
        for (TaskGenerateRequestDto.MemberInfoDto m : request.getMembers()) {
            sb.append("- 이름: ").append(m.getName())
              .append(" | 직급: ").append(m.getPosition());
            if (m.getPortfolio() != null && !m.getPortfolio().isBlank()) {
                sb.append(" | 포트폴리오: ").append(m.getPortfolio());
            }
            sb.append("\n");
        }
        sb.append("\n");

        sb.append("=== 지시사항 ===\n");
        sb.append("- 프로젝트 목표를 달성하기 위한 구체적인 태스크 5~10개를 생성하세요.\n");
        sb.append("- 각 태스크는 팀원의 역할과 역량을 고려하여 적절히 배분하세요.\n");
        sb.append("- 마감일은 프로젝트 시작일과 마감일 사이로 설정하세요.\n");
        sb.append("- 우선순위(HIGH/MEDIUM/LOW)를 적절히 부여하세요.\n\n");

        sb.append("=== 출력 형식 ===\n");
        sb.append("반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.\n\n");
        sb.append("{\n");
        sb.append("  \"tasks\": [\n");
        sb.append("    {\n");
        sb.append("      \"title\": \"태스크 제목\",\n");
        sb.append("      \"description\": \"태스크 상세 설명\",\n");
        sb.append("      \"assignee\": \"담당자 이름\",\n");
        sb.append("      \"priority\": \"HIGH\",\n");
        sb.append("      \"dueDate\": \"YYYY-MM-DD\"\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");

        return sb.toString();
    }

    private TaskGenerateResponseDto parseTaskGenerateResponse(String response) {
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

            return objectMapper.readValue(text, TaskGenerateResponseDto.class);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("태스크 생성 응답 파싱 실패: " + e.getMessage());
        }
    }
}
