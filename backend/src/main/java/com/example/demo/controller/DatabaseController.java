package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DatabaseController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private DriverHistoryRepository driverHistoryRepository;

    @Autowired
    private OwnerBookingRepository ownerBookingRepository;

    @Autowired
    private ActiveSessionRepository activeSessionRepository;

    @Autowired
    private UpcomingBookingRepository upcomingBookingRepository;

    @Autowired
    private DatabaseService databaseService;

    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> getDatabase() {
        Map<String, Object> db = new HashMap<>();

        // Load User
        List<User> users = userRepository.findAll();
        User currentUser = null;
        if (!users.isEmpty()) {
            currentUser = users.get(0);
        } else {
            // Seed one if empty
            databaseService.reset();
            currentUser = userRepository.findAll().get(0);
        }
        db.put("currentUser", currentUser);

        // Load Chargers
        List<Charger> chargers = chargerRepository.findAll();
        List<Map<String, Object>> formattedChargers = chargers.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("location", c.getLocation());
            map.put("status", c.getStatus());
            map.put("price", c.getPrice());
            map.put("power", c.getPower());
            map.put("connector", c.getConnector());
            map.put("distance", c.getDistance());

            Map<String, Object> coords = new HashMap<>();
            coords.put("lat", c.getLat());
            coords.put("lng", c.getLng());
            map.put("coords", coords);

            map.put("rating", c.getRating());
            map.put("reviewsCount", c.getReviewsCount());
            map.put("ownedByUser", c.isOwnedByUser());
            map.put("host", c.getHost());
            map.put("hostAvatar", c.getHostAvatar());
            map.put("image", c.getImage());
            map.put("hours", c.getHours());
            map.put("restrictions", c.getRestrictions());

            List<String> amenities = new ArrayList<>();
            if (c.getAmenities() != null && !c.getAmenities().trim().isEmpty()) {
                amenities = Arrays.asList(c.getAmenities().split(","));
            }
            map.put("amenities", amenities);

            return map;
        }).collect(Collectors.toList());
        db.put("chargers", formattedChargers);

        // Load Reviews
        List<Review> reviews = reviewRepository.findAll();
        List<Map<String, Object>> formattedReviews = reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("chargerId", r.getChargerId());
            map.put("userName", r.getUserName());
            map.put("avatar", r.getAvatar());
            map.put("rating", r.getRating());
            map.put("text", r.getText());
            map.put("date", r.getDate());

            List<String> tags = new ArrayList<>();
            if (r.getTags() != null && !r.getTags().trim().isEmpty()) {
                tags = Arrays.asList(r.getTags().split(","));
            }
            map.put("tags", tags);

            map.put("helpfulCount", r.getHelpfulCount());
            map.put("location", r.getLocation());
            return map;
        }).collect(Collectors.toList());
        db.put("reviews", formattedReviews);

        // Load Driver History
        db.put("driverHistory", driverHistoryRepository.findAll());

        // Load Owner Bookings
        db.put("ownerBookings", ownerBookingRepository.findAll());

        // Load Active Session
        List<ActiveSession> activeSessions = activeSessionRepository.findAll();
        db.put("activeSession", activeSessions.isEmpty() ? null : activeSessions.get(0));

        // Load Upcoming Booking
        List<UpcomingBooking> upcomingBookings = upcomingBookingRepository.findAll();
        db.put("upcomingBooking", upcomingBookings.isEmpty() ? null : upcomingBookings.get(0));

        return ResponseEntity.ok(db);
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncDatabase(@RequestBody Map<String, Object> payload) {
        try {
            databaseService.sync(payload);
            return ResponseEntity.ok("Successfully synced database.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error syncing database: " + e.getMessage());
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetDatabase() {
        try {
            databaseService.reset();
            return ResponseEntity.ok("Successfully reset database.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error resetting database: " + e.getMessage());
        }
    }
}
