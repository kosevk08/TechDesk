package com.edutech.desk.repository;

import com.edutech.desk.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEgnOrderByCreatedAtDesc(String userEgn);
}
