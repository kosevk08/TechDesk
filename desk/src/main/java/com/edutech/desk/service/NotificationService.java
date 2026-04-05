package com.edutech.desk.service;

import com.edutech.desk.entities.Notification;
import java.util.List;

public interface NotificationService {
    Notification create(String userEgn, String type, String message);
    List<Notification> getByUser(String userEgn);
    Notification markRead(Long id);
}
