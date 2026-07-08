package com.hometuitions.backend.booking.service;

import com.hometuitions.backend.booking.dto.AvailabilityRuleRequest;
import com.hometuitions.backend.booking.entity.AvailabilityRule;

import java.util.List;
import java.util.UUID;

/**
 * Owned by the booking module per docs/phase2/02-high-level-design.md's ownership
 * matrix (availability_rules feeds slot-conflict checks at booking time), even
 * though it's exposed to tutors via a controller that reads like it belongs to
 * the tutor/profile surface area.
 */
public interface AvailabilityService {

    List<AvailabilityRule> listForTutor(UUID tutorId);

    AvailabilityRule addRule(UUID tutorId, AvailabilityRuleRequest request);

    void removeRule(UUID tutorId, UUID ruleId);
}
