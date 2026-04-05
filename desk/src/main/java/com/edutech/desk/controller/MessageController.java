package com.edutech.desk.controller;

import com.edutech.desk.controller.response.MessageResponse;
import com.edutech.desk.entities.Message;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/message")
@CrossOrigin("http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/inbox/{egn}")
    public ResponseEntity<List<MessageResponse>> getInbox(@PathVariable String egn) {
        return ResponseEntity.ok(toResponses(messageService.getInbox(egn), egn));
    }

    @GetMapping("/outbox/{egn}")
    public ResponseEntity<List<MessageResponse>> getOutbox(@PathVariable String egn) {
        return ResponseEntity.ok(toResponses(messageService.getOutbox(egn), egn));
    }

    @GetMapping("/conversation/{egn1}/{egn2}")
    public ResponseEntity<List<MessageResponse>> getConversation(@PathVariable String egn1, @PathVariable String egn2) {
        return ResponseEntity.ok(toResponses(messageService.getConversation(egn1, egn2), egn1));
    }

    @GetMapping("/group")
    public ResponseEntity<List<MessageResponse>> getGroupMessages() {
        return ResponseEntity.ok(toResponses(messageService.getGroupMessages(), currentUserService.getEgn()));
    }

    @GetMapping("/class/{className}")
    public ResponseEntity<List<MessageResponse>> getClassMessages(@PathVariable String className) {
        return ResponseEntity.ok(toResponses(messageService.getClassMessages(className), currentUserService.getEgn()));
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<MessageResponse>> getAnnouncements() {
        return ResponseEntity.ok(toResponses(messageService.getAnnouncements(), currentUserService.getEgn()));
    }

    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody Map<String, String> body) {
        String senderEgn = currentUserService.getEgn();
        String receiverType = body.getOrDefault("receiverType", "PRIVATE");
        String receiverName = body.get("receiverName");
        String content = body.get("content");

        if (senderEgn == null || content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String receiverEgn;
        if ("CLASS".equalsIgnoreCase(receiverType)) {
            receiverEgn = "CLASS:" + receiverName;
        } else if ("ANNOUNCEMENT".equalsIgnoreCase(receiverType)) {
            receiverEgn = "ANNOUNCEMENT";
        } else if ("GROUP".equalsIgnoreCase(receiverType)) {
            receiverEgn = "GROUP";
        } else {
            receiverEgn = nameLookupService.userEgnByDisplayName(receiverName);
        }

        if (receiverEgn == null) {
            return ResponseEntity.badRequest().build();
        }

        Message message = new Message();
        message.setSenderEgn(senderEgn);
        message.setReceiverEgn(receiverEgn);
        message.setContent(content);
        Message saved = messageService.sendMessage(message);
        return ResponseEntity.ok(toResponse(saved, senderEgn));
    }

    @GetMapping("/inbox/me")
    public ResponseEntity<List<MessageResponse>> getMyInbox() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(toResponses(messageService.getInbox(egn), egn));
    }

    @GetMapping("/outbox/me")
    public ResponseEntity<List<MessageResponse>> getMyOutbox() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(toResponses(messageService.getOutbox(egn), egn));
    }

    @GetMapping("/conversation/name/{otherName}")
    public ResponseEntity<List<MessageResponse>> getConversationByName(@PathVariable String otherName) {
        String me = currentUserService.getEgn();
        if (me == null) return ResponseEntity.ok(List.of());
        String otherEgn = nameLookupService.userEgnByDisplayName(otherName);
        if (otherEgn == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(toResponses(messageService.getConversation(me, otherEgn), me));
    }

    private List<MessageResponse> toResponses(List<Message> messages, String meEgn) {
        return messages.stream().map(m -> toResponse(m, meEgn)).collect(Collectors.toList());
    }

    private MessageResponse toResponse(Message message, String meEgn) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderName(resolveReceiverName(message.getSenderEgn()));
        response.setReceiverName(resolveReceiverName(message.getReceiverEgn()));
        response.setContent(message.getContent());
        response.setSentAt(message.getSentAt());
        response.setMine(meEgn != null && meEgn.equals(message.getSenderEgn()));
        return response;
    }

    private String resolveReceiverName(String receiverEgn) {
        if ("GROUP".equalsIgnoreCase(receiverEgn)) return "Group";
        if ("ANNOUNCEMENT".equalsIgnoreCase(receiverEgn)) return "School Announcements";
        if (receiverEgn != null && receiverEgn.startsWith("CLASS:")) {
            return "Class " + receiverEgn.substring("CLASS:".length());
        }
        return nameLookupService.userDisplayName(receiverEgn);
    }
}
