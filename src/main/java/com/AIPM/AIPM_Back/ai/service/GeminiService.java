package com.AIPM.AIPM_Back.ai.service;

import com.AIPM.AIPM_Back.ai.dto.PmAnalysisRequestDto;
import com.AIPM.AIPM_Back.ai.dto.PmAnalysisResponseDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateRequestDto;
import com.AIPM.AIPM_Back.ai.dto.TaskGenerateResponseDto;
import com.AIPM.AIPM_Back.project.entity.ProjectEntity;
import com.AIPM.AIPM_Back.project.repository.ProjectRepository;
import com.AIPM.AIPM_Back.task.entity.TaskEntity;
import com.AIPM.AIPM_Back.task.repository.TaskRepository;
import com.AIPM.AIPM_Back.user.entity.UserEntity;
import com.AIPM.AIPM_Back.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public GeminiService(TaskRepository taskRepository,
                         ProjectRepository projectRepository,
                         UserRepository userRepository) {
        this.webClient = WebClient.create();
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TaskGenerateResponseDto generateTasks(TaskGenerateRequestDto request) {
        ProjectEntity project = projectRepository.findByUuid(request.getProjectUuid())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + request.getProjectUuid()));

        // 팀원 이름 -> UserEntity 매핑
        Map<String, UserEntity> nameToUser = new java.util.HashMap<>();
        for (TaskGenerateRequestDto.MemberInfoDto member : request.getMembers()) {
            userRepository.findByUuid(member.getUserUuid()).ifPresent(user ->
                    nameToUser.put(member.getName(), user));
        }

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

        TaskGenerateResponseDto result = parseResponse(response);

        // DB에 태스크 저장
        if (result.getTasks() != null) {
            for (TaskGenerateResponseDto.TaskDto taskDto : result.getTasks()) {
                UserEntity assignee = nameToUser.get(taskDto.getAssignee());

                TaskEntity taskEntity = TaskEntity.builder()
                        .project(project)
                        .assignee(assignee)
                        .title(taskDto.getTitle())
                        .description(taskDto.getDescription())
                        .status(TaskEntity.TaskStatus.PLANNED)
                        .priority(parsePriority(taskDto.getPriority()))
                        .dueDate(taskDto.getDueDate() != null ? LocalDate.parse(taskDto.getDueDate()) : null)
                        .createdBy(TaskEntity.CreatedBy.AI)
                        .build();

                taskRepository.save(taskEntity);
            }
        }

        return result;
    }

    private TaskEntity.TaskPriority parsePriority(String priority) {
        if (priority == null) return TaskEntity.TaskPriority.MEDIUM;
        return switch (priority.toUpperCase()) {
            case "HIGH" -> TaskEntity.TaskPriority.HIGH;
            case "LOW" -> TaskEntity.TaskPriority.LOW;
            default -> TaskEntity.TaskPriority.MEDIUM;
        };
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

    // ────────────────────────────────────────────────────────────────
    // PM 인사이트 분석
    // ────────────────────────────────────────────────────────────────

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
        sb.append("PM 관점의 인사이트를 도출하세요.\n\n");

        // 프로젝트 정보
        sb.append("=== 프로젝트 정보 ===\n");
        sb.append("프로젝트명: ").append(request.getProjectName()).append("\n");
        sb.append("시작일: ").append(request.getStartDate()).append("\n");
        sb.append("마감일: ").append(request.getEndDate()).append("\n\n");

        // 팀원 포트폴리오
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

        // 태스크 목록
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

        // 분석 지시사항
        sb.append("=== 분석 지시사항 ===\n");
        sb.append("1. [일정 예측] 각 태스크에 대해 담당자의 포트폴리오(경력, 기술스택, 숙련도)를 고려하여\n");
        sb.append("   해당 팀원이 작업할 경우 예상 소요일을 추정하고, 예상 완료일을 계산하세요.\n");
        sb.append("   오늘 날짜를 기준으로 아직 시작하지 않은 태스크(PLANNED)는 오늘부터 시작한다고 가정하세요.\n");
        sb.append("   IN_PROGRESS 태스크는 오늘부터 남은 작업량을 기준으로 계산하세요.\n\n");

        sb.append("2. [리스크 경고] 다음 유형의 리스크를 탐지하세요:\n");
        sb.append("   - DEADLINE: 마감일 기준으로 늦춰질 가능성이 있는 태스크\n");
        sb.append("     (예: '이 태스크를 이번 주 내에 시작하지 않으면 전체 일정이 N일 지연됩니다')\n");
        sb.append("   - OVERLOAD: 특정 팀원에게 업무가 집중되어 병목이 예상되는 경우\n");
        sb.append("   - BOTTLENECK: 다른 태스크의 선행 조건이 되는 태스크가 지연되는 경우\n");
        sb.append("   - DEPENDENCY: 담당자 미배정으로 진행이 막힌 태스크\n\n");

        sb.append("3. [우선순위 재조정] COMPLETED가 아닌 태스크 전체를 대상으로,\n");
        sb.append("   지금 당장 처리해야 할 순서를 판단하세요.\n");
        sb.append("   마감 임박도, 의존성, 담당자 업무 부하, 비즈니스 임팩트를 종합적으로 고려하세요.\n\n");

        // 출력 형식 (엄격하게 지정)
        sb.append("=== 출력 형식 ===\n");
        sb.append("반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.\n");
        sb.append("taskUuid는 입력에서 받은 값을 그대로 사용하세요.\n\n");
        sb.append("{\n");
        sb.append("  \"taskEstimates\": [\n");
        sb.append("    {\n");
        sb.append("      \"taskUuid\": \"태스크 UUID\",\n");
        sb.append("      \"taskTitle\": \"태스크 제목\",\n");
        sb.append("      \"assignee\": \"담당자 이름\",\n");
        sb.append("      \"estimatedDays\": 3,\n");
        sb.append("      \"estimatedCompletionDate\": \"YYYY-MM-DD\",\n");
        sb.append("      \"reason\": \"예측 근거 한 줄 요약\"\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"projectEstimatedCompletionDate\": \"YYYY-MM-DD\",\n");
        sb.append("  \"riskWarnings\": [\n");
        sb.append("    {\n");
        sb.append("      \"type\": \"DEADLINE\",\n");
        sb.append("      \"severity\": \"HIGH\",\n");
        sb.append("      \"message\": \"구체적인 경고 메시지\",\n");
        sb.append("      \"relatedTaskUuid\": \"태스크 UUID 또는 null\",\n");
        sb.append("      \"relatedMember\": \"팀원 이름 또는 null\"\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"prioritizedTasks\": [\n");
        sb.append("    {\n");
        sb.append("      \"rank\": 1,\n");
        sb.append("      \"taskUuid\": \"태스크 UUID\",\n");
        sb.append("      \"taskTitle\": \"태스크 제목\",\n");
        sb.append("      \"assignee\": \"담당자 이름\",\n");
        sb.append("      \"reason\": \"이 순서로 처리해야 하는 이유\"\n");
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
