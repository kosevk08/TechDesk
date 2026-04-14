package com.edutech.desk.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the TechThrone API.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        var cors = registry.addMapping("/**")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);

        // Spring rejects allowCredentials(true) when allowedOrigins contains "*".
        if (java.util.Arrays.stream(allowedOrigins).anyMatch("*"::equals)) {
            cors.allowedOriginPatterns(allowedOrigins);
        } else {
            cors.allowedOrigins(allowedOrigins);
        }
    }
}
