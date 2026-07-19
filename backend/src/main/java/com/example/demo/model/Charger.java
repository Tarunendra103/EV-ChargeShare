package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "chargers")
public class Charger {
    @Id
    private String id;
    private String name;
    private String location;
    private String status;
    private Double price;
    private String power;
    private String connector;
    private String distance;
    
    private Double lat;
    private Double lng;
    private Double rating;
    private Integer reviewsCount;
    private boolean ownedByUser;
    private String host;
    
    @Column(length = 2000)
    private String hostAvatar;
    
    @Column(length = 2000)
    private String image;
    
    @Column(length = 2000)
    private String hours;
    
    private String restrictions;
    private String amenities;

    public Charger() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getPower() { return power; }
    public void setPower(String power) { this.power = power; }
    public String getConnector() { return connector; }
    public void setConnector(String connector) { this.connector = connector; }
    public String getDistance() { return distance; }
    public void setDistance(String distance) { this.distance = distance; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }
    public boolean isOwnedByUser() { return ownedByUser; }
    public void setOwnedByUser(boolean ownedByUser) { this.ownedByUser = ownedByUser; }
    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }
    public String getHostAvatar() { return hostAvatar; }
    public void setHostAvatar(String hostAvatar) { this.hostAvatar = hostAvatar; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }
    public String getRestrictions() { return restrictions; }
    public void setRestrictions(String restrictions) { this.restrictions = restrictions; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}
