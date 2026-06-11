# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
COPY kitchen-service/pom.xml kitchen-service/
RUN mvn -f pom.xml -pl kitchen-service -am dependency:go-offline -q

COPY kitchen-service/src kitchen-service/src
RUN mvn -f pom.xml -pl kitchen-service -am package -DskipTests -q

# ---- Run Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/kitchen-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
