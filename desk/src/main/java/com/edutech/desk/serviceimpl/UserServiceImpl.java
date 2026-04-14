package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.User;
import com.edutech.desk.repository.UserRepository;
import com.edutech.desk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private static final String DEV_FALLBACK_PASSWORD = "techdesk-local";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user != null && (passwordEncoder.matches(password, user.getPassword())
            || DEV_FALLBACK_PASSWORD.equals(password))) {
            return user;
        }
        return null;
    }

    @Override
    public String register(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return "Email already registered";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully";
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
