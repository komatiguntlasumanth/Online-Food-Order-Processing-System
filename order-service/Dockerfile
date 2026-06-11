# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy root pom first for dependency caching
COPY pom.xml .
COPY order-service/pom.xml order-service/
RUN mvn -f pom.xml -pl order-service -am dependency:go-offline -q

# Copy source and build
COPY order-service/src order-service/src
RUN mvn -f pom.xml -pl order-service -am package -DskipTests -q

# ---- Run Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/order-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
