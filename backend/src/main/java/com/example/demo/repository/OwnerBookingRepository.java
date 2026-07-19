package com.example.demo.repository;

import com.example.demo.model.OwnerBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnerBookingRepository extends JpaRepository<OwnerBooking, String> {
}
