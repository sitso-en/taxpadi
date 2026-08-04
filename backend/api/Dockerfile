# Stage 1 — Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2 — Run
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/api-*.jar app.jar
EXPOSE 8080
# Fit the JVM inside Render's 512MB free tier: cap the heap, use the low-overhead
# serial GC (G1 reserves a lot of native memory), and stop JIT at C1 to shrink the
# code cache. Keeps total RSS under 512MB so the login-time request burst doesn't OOM.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-jar", "app.jar"]
