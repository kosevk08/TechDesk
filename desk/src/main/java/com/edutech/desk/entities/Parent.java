package com.edutech.desk.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "parents")
public class Parent {

    @Id
    @Column(nullable = false, unique = true)
    private String egn;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String childEgn;

    public Parent() {}

    public String getEgn() { return egn; }
    public void setEgn(String egn) { this.egn = egn; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getChildEgn() { return childEgn; }
    public void setChildEgn(String childEgn) { this.childEgn = childEgn; }
}