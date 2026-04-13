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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        userRepository.save(user);
        return "User registered successfully";
    }

    @Override
    public User getUserById(Long id) {
        // Converting id to String if your UserRepository still uses String as the ID type
        // If you updated UserRepository to <User, Long>, you can remove .toString()
        return userRepository.findById(id.toString()).orElse(null);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
