package com.hometuitions.backend.booking.service.impl;

import com.hometuitions.backend.booking.dto.AvailabilityRuleRequest;
import com.hometuitions.backend.booking.entity.AvailabilityRule;
import com.hometuitions.backend.booking.repository.AvailabilityRuleRepository;
import com.hometuitions.backend.booking.service.AvailabilityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRuleRepository repository;

    public AvailabilityServiceImpl(AvailabilityRuleRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<AvailabilityRule> listForTutor(UUID tutorId) {
        return repository.findByTutorIdOrderByDayOfWeekAscStartTimeAsc(tutorId);
    }

    @Override
    public AvailabilityRule addRule(UUID tutorId, AvailabilityRuleRequest request) {
        AvailabilityRule rule = new AvailabilityRule();
        rule.setTutorId(tutorId);
        rule.setDayOfWeek(request.dayOfWeek());
        rule.setStartTime(request.startTime());
        rule.setEndTime(request.endTime());
        return repository.save(rule);
    }

    @Override
    public void removeRule(UUID tutorId, UUID ruleId) {
        // Scoped delete (tutorId + ruleId together) so one tutor can never remove
        // another tutor's availability rule by guessing an id.
        repository.deleteByIdAndTutorId(ruleId, tutorId);
    }
}
