package com.edutech.desk.controller;

import com.edutech.desk.controller.response.NotebookResponse;
import com.edutech.desk.entities.Notebook;
import com.edutech.desk.service.NameLookupService;
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

    @Autowired
    private NameLookupService nameLookupService;

    @GetMapping("/child-notebook/{egn}")
    public ResponseEntity<NotebookResponse> viewChildNotebook(@PathVariable String egn) {
        Notebook notebook = parentService.getChildNotebook(egn);
        if (notebook != null) {
            NotebookResponse response = new NotebookResponse();
            response.setId(notebook.getId());
            response.setStudentName(nameLookupService.studentName(notebook.getStudentEgn()));
            response.setSubject(notebook.getSubject());
            response.setSchoolYear(notebook.getSchoolYear());
            response.setFormat(notebook.getFormat());
            response.setStyle(notebook.getStyle());
            response.setColor(notebook.getColor());
            response.setContent(notebook.getContent());
            response.setPageNumber(notebook.getPageNumber());
            response.setLastUpdated(notebook.getLastUpdated());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }
}
