package com.hometuitions.backend.booking.repository;

import com.hometuitions.backend.booking.entity.AvailabilityRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AvailabilityRuleRepository extends JpaRepository<AvailabilityRule, UUID> {
    List<AvailabilityRule> findByTutorIdOrderByDayOfWeekAscStartTimeAsc(UUID tutorId);
    void deleteByIdAndTutorId(UUID id, UUID tutorId);
}
