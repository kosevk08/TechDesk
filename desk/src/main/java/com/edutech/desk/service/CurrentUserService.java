package com.edutech.desk.service;

import com.edutech.desk.entities.User;
import com.edutech.desk.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String getEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equalsIgnoreCase(auth.getName())) {
            return auth.getName();
        }
        HttpServletRequest request = currentRequest();
        if (request == null) return null;
        String emailHeader = request.getHeader("X-User-Email");
        if (emailHeader != null && !emailHeader.isBlank()) {
            return emailHeader.trim();
        }
        return null;
    }

    public User getUser() {
        String email = getEmail();
        if (email != null) {
            User byEmail = userRepository.findByEmail(email);
            if (byEmail != null) return byEmail;
        }
        HttpServletRequest request = currentRequest();
        if (request != null) {
            String egnHeader = request.getHeader("X-User-Egn");
            if (egnHeader != null && !egnHeader.isBlank()) {
                return userRepository.findById(egnHeader.trim()).orElse(null);
            }
        }
        return null;
    }

    public String getEgn() {
        User user = getUser();
        return user != null ? user.getEgn() : null;
    }

    private HttpServletRequest currentRequest() {
        var attributes = RequestContextHolder.getRequestAttributes();
        if (!(attributes instanceof ServletRequestAttributes servletRequestAttributes)) return null;
        return servletRequestAttributes.getRequest();
    }
}
