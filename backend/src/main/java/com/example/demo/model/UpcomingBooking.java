package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "upcoming_booking")
public class UpcomingBooking {
    @Id
    private Long id = 1L; // Since there is only at most one upcoming booking, hardcode to 1
    
    private String chargerId;
    private String chargerName;
    private String date;
    private String timeSlot;
    private Double price;
    private String stall;

    public UpcomingBooking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getChargerId() { return chargerId; }
    public void setChargerId(String chargerId) { this.chargerId = chargerId; }
    public String getChargerName() { return chargerName; }
    public void setChargerName(String chargerName) { this.chargerName = chargerName; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getStall() { return stall; }
    public void setStall(String stall) { this.stall = stall; }
}
