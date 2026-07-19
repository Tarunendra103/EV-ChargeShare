package com.example.demo.repository;

import com.example.demo.model.UpcomingBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpcomingBookingRepository extends JpaRepository<UpcomingBooking, Long> {
}
