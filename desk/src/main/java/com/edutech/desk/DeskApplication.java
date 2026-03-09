package com.edutech.desk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.edutech.desk.repository")
public class DeskApplication {
    public static void main(String[] args) {
        SpringApplication.run(DeskApplication.class, args);
    }
}