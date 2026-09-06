package com.hometuitions.backend.leads.controller;

import com.hometuitions.backend.common.ratelimit.RateLimited;
import com.hometuitions.backend.common.storage.StorageService;
import com.hometuitions.backend.leads.dto.*;
import com.hometuitions.backend.leads.service.LeadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.UUID;

/** Public, unauthenticated lead-capture endpoints backing the website's /request-tutor,
 *  /tutor-registration, and /contact forms - anonymous visitors submit these before any
 *  account exists, so each is rate-limited per client IP to guard against spam/abuse. */
@RestController
@RequestMapping("/api/v1/leads")
@Tag(name = "Leads")
public class LeadController {

    private static final Duration UPLOAD_URL_TTL = Duration.ofMinutes(15);
    private static final Duration DOWNLOAD_URL_TTL = Duration.ofDays(30);

    private final LeadService leadService;
    private final StorageService storageService;

    public LeadController(LeadService leadService,
                          @Autowired(required = false) StorageService storageService) {
        this.leadService = leadService;
        this.storageService = storageService;
    }

    @PostMapping("/tuition-inquiries")
    @RateLimited(bucket = "lead-submit", capacity = 10, refillMinutes = 15)
    public ResponseEntity<TuitionInquiryResponse> submitTuitionInquiry(
            @Valid @RequestBody SubmitTuitionInquiryRequest request) {
        var inquiry = leadService.submitTuitionInquiry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TuitionInquiryResponse.from(inquiry));
    }

    @PostMapping("/upload-url")
    @RateLimited(bucket = "lead-upload", capacity = 15, refillMinutes = 15)
    public ResponseEntity<LeadUploadUrlResponse> createUploadUrl(
            @Valid @RequestBody LeadUploadUrlRequest request) {
        if (storageService == null) {
            String pseudoKey = "tutor-applications/anon-" + UUID.randomUUID() + "/" + request.filename();
            return ResponseEntity.ok(new LeadUploadUrlResponse(null, pseudoKey, null));
        }

        String prefix = request.documentType() != null ? "tutor-applications/" + request.documentType() : "tutor-applications";
        String key = storageService.buildKey(prefix, "anon-" + UUID.randomUUID().toString().substring(0, 8), request.filename());
        var uploadUrl = storageService.generateUploadUrl(key, request.contentType(), UPLOAD_URL_TTL);
        var publicUrl = storageService.generateDownloadUrl(key, DOWNLOAD_URL_TTL);

        return ResponseEntity.ok(new LeadUploadUrlResponse(
                uploadUrl.toString(),
                key,
                publicUrl.toString()
        ));
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
