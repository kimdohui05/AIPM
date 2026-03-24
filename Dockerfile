# 1단계: 빌드 단계
# Gradle + Java 21 환경에서 앱을 빌드함
FROM gradle:8.5-jdk21 AS build

# 컨테이너 안에서 작업할 폴더 지정
WORKDIR /app

# 프로젝트 파일 전체를 컨테이너 안으로 복사
COPY . .

# Gradle로 앱을 빌드 (테스트는 건너뜀)
RUN gradle bootJar --no-daemon -x test

# 2단계: 실행 단계
# 빌드 결과물(jar 파일)만 가져와서 실행하는 가벼운 환경
FROM eclipse-temurin:21-jre

WORKDIR /app

# 1단계에서 만들어진 jar 파일만 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 앱이 사용하는 포트 (Spring Boot 기본값)
EXPOSE 8080

# 컨테이너 시작 시 실행할 명령어
ENTRYPOINT ["java", "-jar", "app.jar"]