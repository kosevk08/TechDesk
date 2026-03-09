package com.edutech.desk.service;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Parent;
import java.util.List;

public interface ParentService {
    Notebook getChildNotebook(String childEgn);
    Parent getParentByEgn(String egn);
    List<Parent> getAllParents();
}