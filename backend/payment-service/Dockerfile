# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
COPY payment-service/pom.xml payment-service/
RUN mvn -f pom.xml -pl payment-service -am dependency:go-offline -q

COPY payment-service/src payment-service/src
RUN mvn -f pom.xml -pl payment-service -am package -DskipTests -q

# ---- Run Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/payment-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
