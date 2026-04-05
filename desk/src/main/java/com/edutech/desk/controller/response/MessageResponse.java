package com.edutech.desk.controller.response;

import java.time.LocalDateTime;

public class MessageResponse {
    private Long id;
    private String senderName;
    private String receiverName;
    private String content;
    private LocalDateTime sentAt;
    private boolean mine;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public boolean isMine() { return mine; }
    public void setMine(boolean mine) { this.mine = mine; }
}
