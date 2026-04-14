package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.User;
import com.edutech.desk.repository.UserRepository;
import com.edutech.desk.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    @Override
    public String register(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return "Email already registered";
        }
        userRepository.save(user);
        return "User registered successfully";
    }

    @Override
    public User getUserByEgn(String egn) {
        return userRepository.findById(egn).orElse(null);
    }

    @Override
    public User getUserById(Long id) {
        return null;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}