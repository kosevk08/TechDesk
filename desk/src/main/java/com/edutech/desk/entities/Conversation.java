package com.edutech.desk.entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @Column(nullable = false, unique = true)
    private String conversationId;

    @Column(nullable = false)
    private String title;

    @ElementCollection
    private List<String> participantEgns;

    public Conversation() {}

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<String> getParticipantEgns() { return participantEgns; }
    public void setParticipantEgns(List<String> participantEgns) { this.participantEgns = participantEgns; }
}