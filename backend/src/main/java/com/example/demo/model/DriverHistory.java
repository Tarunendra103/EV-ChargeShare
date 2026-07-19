package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "driver_history")
public class DriverHistory {
    @Id
    private String id;
    private String chargerName;
    private Double price;
    private String energy;
    private String duration;
    private String date;

    public DriverHistory() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getChargerName() { return chargerName; }
    public void setChargerName(String chargerName) { this.chargerName = chargerName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getEnergy() { return energy; }
    public void setEnergy(String energy) { this.energy = energy; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
