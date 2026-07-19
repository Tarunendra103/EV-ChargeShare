package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    private String id;
    private String chargerId;
    private String userName;
    
    @Column(length = 2000)
    private String avatar;
    
    private int rating;
    
    @Column(length = 4000)
    private String text;
    
    private String date;
    
    private String tags; // Stored as comma-separated values (e.g. "Clean,Fast")
    private int helpfulCount;
    private String location;

    public Review() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getChargerId() { return chargerId; }
    public void setChargerId(String chargerId) { this.chargerId = chargerId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public int getHelpfulCount() { return helpfulCount; }
    public void setHelpfulCount(int helpfulCount) { this.helpfulCount = helpfulCount; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
