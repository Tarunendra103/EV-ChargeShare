package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "owner_bookings")
public class OwnerBooking {
    @Id
    private String id;
    private String driverName;
    
    @Column(length = 2000)
    private String driverAvatar;
    
    private String vehicle;
    private String timeText;
    private String durationText;
    private String status;
    private boolean isActive;

    public OwnerBooking() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getDriverAvatar() { return driverAvatar; }
    public void setDriverAvatar(String driverAvatar) { this.driverAvatar = driverAvatar; }
    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }
    public String getTimeText() { return timeText; }
    public void setTimeText(String timeText) { this.timeText = timeText; }
    public String getDurationText() { return durationText; }
    public void setDurationText(String durationText) { this.durationText = durationText; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
