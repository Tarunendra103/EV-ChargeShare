package com.example.demo.repository;

import com.example.demo.model.DriverHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverHistoryRepository extends JpaRepository<DriverHistory, String> {
}
