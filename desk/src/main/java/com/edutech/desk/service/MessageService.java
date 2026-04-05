package com.edutech.desk.service;

import com.edutech.desk.entities.Message;
import java.util.List;

public interface MessageService {
    List<Message> getInbox(String egn);
    List<Message> getOutbox(String egn);
    List<Message> getConversation(String egn1, String egn2);
    List<Message> getGroupMessages();
    List<Message> getClassMessages(String className);
    List<Message> getAnnouncements();
    Message sendMessage(Message message);
}
