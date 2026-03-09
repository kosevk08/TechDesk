package com.edutech.desk.controller;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parent")
@CrossOrigin("http://localhost:3000")
public class ParentController {

    @Autowired
    private ParentService parentService;

    @GetMapping("/child-notebook/{egn}")
    public ResponseEntity<Notebook> viewChildNotebook(@PathVariable String egn) {
        Notebook notebook = parentService.getChildNotebook(egn);
        if (notebook != null) {
            return ResponseEntity.ok(notebook);
        }
        return ResponseEntity.notFound().build();
    }
}