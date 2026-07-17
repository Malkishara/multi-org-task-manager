# ================================
# Stage 1 - Build with Java 21
# ================================
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy Maven configuration
COPY pom.xml .

# Download dependencies (cache layer)
RUN mvn dependency:resolve -B

# Copy source
COPY src ./src

# Build application
RUN mvn clean package -DskipTests -B


# ================================
# Stage 2 - Run with Java 21
# ================================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy jar
COPY --from=build /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]