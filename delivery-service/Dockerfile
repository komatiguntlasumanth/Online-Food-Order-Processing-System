# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
COPY delivery-service/pom.xml delivery-service/
RUN mvn -f pom.xml -pl delivery-service -am dependency:go-offline -q

COPY delivery-service/src delivery-service/src
RUN mvn -f pom.xml -pl delivery-service -am package -DskipTests -q

# ---- Run Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/delivery-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
