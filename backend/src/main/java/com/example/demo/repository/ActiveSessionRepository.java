package com.example.demo.repository;

import com.example.demo.model.ActiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActiveSessionRepository extends JpaRepository<ActiveSession, Long> {
}
