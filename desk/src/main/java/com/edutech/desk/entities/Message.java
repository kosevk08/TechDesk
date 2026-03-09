package com.edutech.desk.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderEgn;

    @Column(nullable = false)
    private String receiverEgn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private LocalDateTime sentAt;

    public Message() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSenderEgn() { return senderEgn; }
    public void setSenderEgn(String senderEgn) { this.senderEgn = senderEgn; }
    public String getReceiverEgn() { return receiverEgn; }
    public void setReceiverEgn(String receiverEgn) { this.receiverEgn = receiverEgn; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}