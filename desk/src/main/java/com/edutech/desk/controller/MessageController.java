package com.edutech.desk.controller;

import com.edutech.desk.entities.Message;
import com.edutech.desk.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/message")
@CrossOrigin("http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/inbox/{egn}")
    public ResponseEntity<List<Message>> getInbox(@PathVariable String egn) {
        return ResponseEntity.ok(messageService.getInbox(egn));
    }

    @GetMapping("/outbox/{egn}")
    public ResponseEntity<List<Message>> getOutbox(@PathVariable String egn) {
        return ResponseEntity.ok(messageService.getOutbox(egn));
    }

    @GetMapping("/conversation/{egn1}/{egn2}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable String egn1, @PathVariable String egn2) {
        return ResponseEntity.ok(messageService.getConversation(egn1, egn2));
    }

    @GetMapping("/group")
    public ResponseEntity<List<Message>> getGroupMessages() {
        return ResponseEntity.ok(messageService.getGroupMessages());
    }

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.sendMessage(message));
    }
}