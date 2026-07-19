package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class DatabaseService {

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

    // Null-safe numeric helpers
    private Double toDouble(Object val) {
        if (val == null) return null;
        return ((Number) val).doubleValue();
    }

    private Integer toInt(Object val) {
        if (val == null) return null;
        return ((Number) val).intValue();
    }

    @Transactional
    public void sync(Map<String, Object> payload) {
        // Sync User
        Map<String, Object> userMap = (Map<String, Object>) payload.get("currentUser");
        if (userMap != null) {
            User user = new User(
                (String) userMap.get("email"),
                (Boolean) userMap.get("isAuthenticated"),
                (String) userMap.get("role"),
                (String) userMap.get("name"),
                (String) userMap.get("avatar"),
                (String) userMap.get("vehicle"),
                toDouble(userMap.get("balance")),
                (String) userMap.get("phone")
            );
            userRepository.save(user);
        }

        // Sync Chargers
        List<Map<String, Object>> chargersList = (List<Map<String, Object>>) payload.get("chargers");
        if (chargersList != null) {
            chargerRepository.deleteAllInBatch();
            for (Map<String, Object> cMap : chargersList) {
                Charger charger = new Charger();
                charger.setId((String) cMap.get("id"));
                charger.setName((String) cMap.get("name"));
                charger.setLocation((String) cMap.get("location"));
                charger.setStatus((String) cMap.get("status"));
                charger.setPrice(toDouble(cMap.get("price")));
                charger.setPower((String) cMap.get("power"));
                charger.setConnector((String) cMap.get("connector"));
                charger.setDistance((String) cMap.get("distance"));
                
                // Parse coordinates
                Map<String, Object> coordsMap = (Map<String, Object>) cMap.get("coords");
                if (coordsMap != null) {
                    charger.setLat(toDouble(coordsMap.get("lat")));
                    charger.setLng(toDouble(coordsMap.get("lng")));
                }
                
                charger.setRating(toDouble(cMap.get("rating")));
                charger.setReviewsCount(toInt(cMap.get("reviewsCount")));
                Object ownedByUser = cMap.get("ownedByUser");
                charger.setOwnedByUser(ownedByUser != null && (Boolean) ownedByUser);
                charger.setHost((String) cMap.get("host"));
                charger.setHostAvatar((String) cMap.get("hostAvatar"));
                charger.setImage((String) cMap.get("image"));
                charger.setHours((String) cMap.get("hours"));
                charger.setRestrictions((String) cMap.get("restrictions"));
                
                // Convert list of strings for amenities
                List<String> amenitiesList = (List<String>) cMap.get("amenities");
                if (amenitiesList != null) {
                    charger.setAmenities(String.join(",", amenitiesList));
                }
                chargerRepository.save(charger);
            }
        }

        // Sync Reviews
        List<Map<String, Object>> reviewsList = (List<Map<String, Object>>) payload.get("reviews");
        if (reviewsList != null) {
            reviewRepository.deleteAllInBatch();
            for (Map<String, Object> rMap : reviewsList) {
                Review review = new Review();
                review.setId((String) rMap.get("id"));
                review.setChargerId((String) rMap.get("chargerId"));
                review.setUserName((String) rMap.get("userName"));
                review.setAvatar((String) rMap.get("avatar"));
                review.setRating(toInt(rMap.get("rating")));
                review.setText((String) rMap.get("text"));
                review.setDate((String) rMap.get("date"));
                
                List<String> tagsList = (List<String>) rMap.get("tags");
                if (tagsList != null) {
                    review.setTags(String.join(",", tagsList));
                }
                review.setHelpfulCount(toInt(rMap.get("helpfulCount")));
                review.setLocation((String) rMap.get("location"));
                reviewRepository.save(review);
            }
        }

        // Sync Driver History
        List<Map<String, Object>> historyList = (List<Map<String, Object>>) payload.get("driverHistory");
        if (historyList != null) {
            driverHistoryRepository.deleteAllInBatch();
            for (Map<String, Object> hMap : historyList) {
                DriverHistory history = new DriverHistory();
                history.setId((String) hMap.get("id"));
                history.setChargerName((String) hMap.get("chargerName"));
                history.setPrice(toDouble(hMap.get("price")));
                history.setEnergy((String) hMap.get("energy"));
                history.setDuration((String) hMap.get("duration"));
                history.setDate((String) hMap.get("date"));
                driverHistoryRepository.save(history);
            }
        }

        // Sync Owner Bookings
        List<Map<String, Object>> bookingsList = (List<Map<String, Object>>) payload.get("ownerBookings");
        if (bookingsList != null) {
            ownerBookingRepository.deleteAllInBatch();
            for (Map<String, Object> bMap : bookingsList) {
                OwnerBooking booking = new OwnerBooking();
                booking.setId((String) bMap.get("id"));
                booking.setDriverName((String) bMap.get("driverName"));
                booking.setDriverAvatar((String) bMap.get("driverAvatar"));
                booking.setVehicle((String) bMap.get("vehicle"));
                booking.setTimeText((String) bMap.get("timeText"));
                booking.setDurationText((String) bMap.get("durationText"));
                booking.setStatus((String) bMap.get("status"));
                Object isActive = bMap.get("isActive");
                booking.setActive(isActive != null && (Boolean) isActive);
                ownerBookingRepository.save(booking);
            }
        }

        // Sync Active Session
        Map<String, Object> activeSessionMap = (Map<String, Object>) payload.get("activeSession");
        activeSessionRepository.deleteAllInBatch();
        if (activeSessionMap != null) {
            ActiveSession session = new ActiveSession();
            session.setChargerId((String) activeSessionMap.get("chargerId"));
            session.setChargerName((String) activeSessionMap.get("chargerName"));
            session.setPrice(toDouble(activeSessionMap.get("price")));
            session.setStartPercent(toInt(activeSessionMap.get("startPercent")));
            session.setTargetPercent(toInt(activeSessionMap.get("targetPercent")));
            session.setCurrentPercent(toInt(activeSessionMap.get("currentPercent")));
            session.setTimeRemaining(toInt(activeSessionMap.get("timeRemaining")));
            session.setEnergyDelivered(toDouble(activeSessionMap.get("energyDelivered")));
            session.setEstimatedCost(toDouble(activeSessionMap.get("estimatedCost")));
            activeSessionRepository.save(session);
        }

        // Sync Upcoming Booking
        Map<String, Object> upcomingBookingMap = (Map<String, Object>) payload.get("upcomingBooking");
        upcomingBookingRepository.deleteAllInBatch();
        if (upcomingBookingMap != null) {
            UpcomingBooking upcoming = new UpcomingBooking();
            upcoming.setChargerId((String) upcomingBookingMap.get("chargerId"));
            upcoming.setChargerName((String) upcomingBookingMap.get("chargerName"));
            upcoming.setDate((String) upcomingBookingMap.get("date"));
            upcoming.setTimeSlot((String) upcomingBookingMap.get("timeSlot"));
            upcoming.setPrice(toDouble(upcomingBookingMap.get("price")));
            upcoming.setStall((String) upcomingBookingMap.get("stall"));
            upcomingBookingRepository.save(upcoming);
        }
    }

    @Transactional
    public void reset() {
        userRepository.deleteAllInBatch();
        chargerRepository.deleteAllInBatch();
        reviewRepository.deleteAllInBatch();
        driverHistoryRepository.deleteAllInBatch();
        ownerBookingRepository.deleteAllInBatch();
        activeSessionRepository.deleteAllInBatch();
        upcomingBookingRepository.deleteAllInBatch();

        // Seed default driver
        User defaultUser = new User(
            "alex.rivers@example.com",
            true,
            "driver",
            "Alex Rivers",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA7ycmqOlE3QVmKX4uBdtpc1x7h8SVfNnhlxXFNoll7lL-weLxRL2M1WdIukWfXSIjn_vlCqGJW_DlmLDFhCIx-eT8-Id8q8K3pof2BKG4pxB6K4yu5NkVPQY80AEozpugogy4ijMEmq2rVKC_RHUzB2w_30QTdkPXsI3jnoJwaK1y1BafZYLrMpXpHfrprNLHDlupckV-tI0pxzb_k7OpaRzCvGTOdR3ZJai2d7yB6-wgeMLJ-PpK1ABQ9oTxvbVCL8yI0gb0JiHGZ",
            "Tesla Model 3 (ABC-1234)",
            5000.00
        );
        userRepository.save(defaultUser);
    }
}
