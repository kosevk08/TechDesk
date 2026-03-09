package com.edutech.desk.service;

import com.edutech.desk.entities.User;
import java.util.List;

public interface UserService {
    User login(String email, String password);
    String register(User user);
    User getUserByEgn(String egn);
    List<User> getAllUsers();
}