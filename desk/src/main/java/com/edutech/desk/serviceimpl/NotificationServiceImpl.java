package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Notification;
import com.edutech.desk.repository.NotificationRepository;
import com.edutech.desk.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Notification create(String userEgn, String type, String message) {
        Notification notification = new Notification();
        notification.setUserEgn(userEgn);
        notification.setType(type);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getByUser(String userEgn) {
        return notificationRepository.findByUserEgnOrderByCreatedAtDesc(userEgn);
    }

    @Override
    public Notification markRead(Long id) {
        Optional<Notification> existing = notificationRepository.findById(id);
        if (existing.isEmpty()) return null;
        Notification notification = existing.get();
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }
}
