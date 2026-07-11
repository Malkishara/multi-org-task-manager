# ================================
# Stage 1 - Build with Java 25
# ================================
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Install Maven manually
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy pom.xml
COPY pom.xml .
RUN mvn dependency:resolve -B --fail-never

# Build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ================================
# Stage 2 - Run with Java 25
# ================================
FROM eclipse-temurin:25-jre
WORKDIR /app

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=build /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]