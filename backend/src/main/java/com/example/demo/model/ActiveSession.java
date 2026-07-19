package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "active_session")
public class ActiveSession {
    @Id
    private Long id = 1L; // Since there is only at most one active session at a time, hardcode to 1
    
    private String chargerId;
    private String chargerName;
    private Double price;
    private Integer startPercent;
    private Integer targetPercent;
    private Integer currentPercent;
    private Integer timeRemaining;
    private Double energyDelivered;
    private Double estimatedCost;

    public ActiveSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getChargerId() { return chargerId; }
    public void setChargerId(String chargerId) { this.chargerId = chargerId; }
    public String getChargerName() { return chargerName; }
    public void setChargerName(String chargerName) { this.chargerName = chargerName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStartPercent() { return startPercent; }
    public void setStartPercent(Integer startPercent) { this.startPercent = startPercent; }
    public Integer getTargetPercent() { return targetPercent; }
    public void setTargetPercent(Integer targetPercent) { this.targetPercent = targetPercent; }
    public Integer getCurrentPercent() { return currentPercent; }
    public void setCurrentPercent(Integer currentPercent) { this.currentPercent = currentPercent; }
    public Integer getTimeRemaining() { return timeRemaining; }
    public void setTimeRemaining(Integer timeRemaining) { this.timeRemaining = timeRemaining; }
    public Double getEnergyDelivered() { return energyDelivered; }
    public void setEnergyDelivered(Double energyDelivered) { this.energyDelivered = energyDelivered; }
    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }
}
