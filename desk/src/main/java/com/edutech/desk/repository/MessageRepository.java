package com.edutech.desk.repository;

import com.edutech.desk.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReceiverEgn(String receiverEgn);
    List<Message> findBySenderEgn(String senderEgn);

    @Query("SELECT m FROM Message m WHERE (m.senderEgn = :egn1 AND m.receiverEgn = :egn2) OR (m.senderEgn = :egn2 AND m.receiverEgn = :egn1) ORDER BY m.sentAt ASC")
    List<Message> findConversation(@Param("egn1") String egn1, @Param("egn2") String egn2);

    @Query("SELECT m FROM Message m WHERE m.receiverEgn = 'GROUP' ORDER BY m.sentAt ASC")
    List<Message> findGroupMessages();

    @Query("SELECT m FROM Message m WHERE m.receiverEgn = :receiver ORDER BY m.sentAt ASC")
    List<Message> findByReceiverCustom(@Param("receiver") String receiver);
}
