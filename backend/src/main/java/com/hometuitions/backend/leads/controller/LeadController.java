package com.hometuitions.backend.leads.controller;

import com.hometuitions.backend.common.ratelimit.RateLimited;
import com.hometuitions.backend.leads.dto.ContactMessageResponse;
import com.hometuitions.backend.leads.dto.SubmitContactMessageRequest;
import com.hometuitions.backend.leads.dto.SubmitTuitionInquiryRequest;
import com.hometuitions.backend.leads.dto.SubmitTutorApplicationRequest;
import com.hometuitions.backend.leads.dto.TuitionInquiryResponse;
import com.hometuitions.backend.leads.dto.TutorApplicationResponse;
import com.hometuitions.backend.leads.service.LeadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public, unauthenticated lead-capture endpoints backing the website's /request-tutor,
 *  /tutor-registration, and /contact forms - anonymous visitors submit these before any
 *  account exists, so each is rate-limited per client IP to guard against spam/abuse. */
@RestController
@RequestMapping("/api/v1/leads")
@Tag(name = "Leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping("/tuition-inquiries")
    @RateLimited(bucket = "lead-submit", capacity = 10, refillMinutes = 15)
    public ResponseEntity<TuitionInquiryResponse> submitTuitionInquiry(
            @Valid @RequestBody SubmitTuitionInquiryRequest request) {
        var inquiry = leadService.submitTuitionInquiry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TuitionInquiryResponse.from(inquiry));
    }

    @PostMapping("/tutor-applications")
    @RateLimited(bucket = "lead-submit", capacity = 10, refillMinutes = 15)
    public ResponseEntity<TutorApplicationResponse> submitTutorApplication(
            @Valid @RequestBody SubmitTutorApplicationRequest request) {
        var application = leadService.submitTutorApplication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TutorApplicationResponse.from(application));
    }

    @PostMapping("/contact-messages")
    @RateLimited(bucket = "lead-submit", capacity = 10, refillMinutes = 15)
    public ResponseEntity<ContactMessageResponse> submitContactMessage(
            @Valid @RequestBody SubmitContactMessageRequest request) {
        var contactMessage = leadService.submitContactMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ContactMessageResponse.from(contactMessage));
    }
}
