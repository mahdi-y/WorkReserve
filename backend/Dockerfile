FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

COPY backend/pom.xml .
COPY backend/.mvn .mvn
COPY backend/mvnw .
COPY backend/mvnw.cmd .

RUN mvn dependency:go-offline

COPY backend/src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=production
ENV SERVER_PORT=10000

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${SERVER_PORT}/api/health || exit 1

ENTRYPOINT ["java", "-Dserver.port=${SERVER_PORT}", "-jar", "app.jar"]
