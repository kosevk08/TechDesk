package com.edutech.desk.service;

import com.edutech.desk.entities.User;
import com.edutech.desk.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String getEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        return auth.getName();
    }

    public User getUser() {
        String email = getEmail();
        if (email == null) return null;
        return userRepository.findByEmail(email);
    }

    public String getEgn() {
        User user = getUser();
        return user != null ? user.getEgn() : null;
    }
}
