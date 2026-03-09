package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Message;
import com.edutech.desk.repository.MessageRepository;
import com.edutech.desk.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Override
    public List<Message> getInbox(String egn) {
        return messageRepository.findByReceiverEgn(egn);
    }

    @Override
    public List<Message> getOutbox(String egn) {
        return messageRepository.findBySenderEgn(egn);
    }

    @Override
    public List<Message> getConversation(String egn1, String egn2) {
        return messageRepository.findConversation(egn1, egn2);
    }

    @Override
    public List<Message> getGroupMessages() {
        return messageRepository.findGroupMessages();
    }

    @Override
    public Message sendMessage(Message message) {
        message.setSentAt(LocalDateTime.now());
        return messageRepository.save(message);
    }
}