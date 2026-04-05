package com.edutech.desk.config;

import com.edutech.desk.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class DemoAccessFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.startsWith("/api/user/login")
            || path.startsWith("/api/user/register")
            || path.startsWith("/api/user/health")
            || path.startsWith("/api/demo/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        Claims claims = jwtService.parseClaims(token);
        boolean isDemo = Boolean.parseBoolean(String.valueOf(claims.get("demo")));
        if (isDemo) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Demo accounts can only access demo data.");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
