package com.edutech.desk.repository;

import com.edutech.desk.entities.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParentRepository extends JpaRepository<Parent, String> {
    Parent findByEmail(String email);
    Parent findByChildEgn(String childEgn);
}