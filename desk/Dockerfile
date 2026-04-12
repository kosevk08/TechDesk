FROM eclipse-temurin:25-jdk-alpine
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN cp src/main/resources/application.properties.example src/main/resources/application.properties
RUN ./mvnw clean package -DskipTests
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/desk-0.0.1-SNAPSHOT.jar"]
