package com.hometuitions.backend.booking.controller;

import com.hometuitions.backend.booking.dto.AvailabilityRuleRequest;
import com.hometuitions.backend.booking.dto.AvailabilityRuleResponse;
import com.hometuitions.backend.booking.service.AvailabilityService;
import com.hometuitions.backend.user.service.TutorProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutors/me/availability")
@Tag(name = "Tutor Availability")
public class TutorAvailabilityController {

    private final AvailabilityService availabilityService;
    private final TutorProfileService tutorProfileService;

    public TutorAvailabilityController(AvailabilityService availabilityService,
                                        TutorProfileService tutorProfileService) {
        this.availabilityService = availabilityService;
        this.tutorProfileService = tutorProfileService;
    }

    @GetMapping
    public List<AvailabilityRuleResponse> list(Authentication authentication) {
        return availabilityService.listForTutor(ownTutorProfileId(authentication)).stream()
                .map(AvailabilityRuleResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<AvailabilityRuleResponse> addRule(Authentication authentication,
                                                             @Valid @RequestBody AvailabilityRuleRequest request) {
        var rule = availabilityService.addRule(ownTutorProfileId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(AvailabilityRuleResponse.from(rule));
    }

    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> removeRule(Authentication authentication, @PathVariable UUID ruleId) {
        availabilityService.removeRule(ownTutorProfileId(authentication), ruleId);
        return ResponseEntity.noContent().build();
    }

    private UUID ownTutorProfileId(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return tutorProfileService.getByUserId(userId).getId();
    }
}
