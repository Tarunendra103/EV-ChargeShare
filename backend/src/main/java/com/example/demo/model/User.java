package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String email;
    private boolean isAuthenticated;
    private String role;
    private String name;
    
    @Column(length = 2000)
    private String avatar;
    
    private String vehicle;
    private Double balance;
    private String phone;

    public User() {}

    public User(String email, boolean isAuthenticated, String role, String name, String avatar, String vehicle, Double balance) {
        this.email = email;
        this.isAuthenticated = isAuthenticated;
        this.role = role;
        this.name = name;
        this.avatar = avatar;
        this.vehicle = vehicle;
        this.balance = balance;
    }

    public User(String email, boolean isAuthenticated, String role, String name, String avatar, String vehicle, Double balance, String phone) {
        this.email = email;
        this.isAuthenticated = isAuthenticated;
        this.role = role;
        this.name = name;
        this.avatar = avatar;
        this.vehicle = vehicle;
        this.balance = balance;
        this.phone = phone;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isAuthenticated() { return isAuthenticated; }
    public void setAuthenticated(boolean isAuthenticated) { this.isAuthenticated = isAuthenticated; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }
    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
