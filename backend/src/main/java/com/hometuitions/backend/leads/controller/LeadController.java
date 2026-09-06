package com.hometuitions.backend.leads.controller;

import com.hometuitions.backend.common.ratelimit.RateLimited;
import com.hometuitions.backend.common.storage.StorageService;
import com.hometuitions.backend.leads.dto.*;
import com.hometuitions.backend.leads.entity.LeadDocument;
import com.hometuitions.backend.leads.repository.LeadDocumentRepository;
import com.hometuitions.backend.leads.service.LeadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.UUID;

/** Public, unauthenticated lead-capture endpoints backing the website's /request-tutor,
 *  /tutor-registration, and /contact forms - anonymous visitors submit these before any
 *  account exists, so each is rate-limited per client IP to guard against spam/abuse. */
@RestController
@RequestMapping("/api/v1/leads")
@Tag(name = "Leads")
@Slf4j
public class LeadController {

    private static final Duration UPLOAD_URL_TTL = Duration.ofMinutes(15);
    private static final Duration DOWNLOAD_URL_TTL = Duration.ofDays(30);

    private final LeadService leadService;
    private final StorageService storageService;
    private final LeadDocumentRepository leadDocumentRepository;

    public LeadController(LeadService leadService,
                          @Autowired(required = false) StorageService storageService,
                          LeadDocumentRepository leadDocumentRepository) {
        this.leadService = leadService;
        this.storageService = storageService;
        this.leadDocumentRepository = leadDocumentRepository;
    }

    @PostMapping("/tuition-inquiries")
    @RateLimited(bucket = "lead-submit", capacity = 10, refillMinutes = 15)
    public ResponseEntity<TuitionInquiryResponse> submitTuitionInquiry(
            @Valid @RequestBody SubmitTuitionInquiryRequest request) {
        var inquiry = leadService.submitTuitionInquiry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TuitionInquiryResponse.from(inquiry));
    }

    @PostMapping("/upload-url")
    @RateLimited(bucket = "lead-upload", capacity = 20, refillMinutes = 15)
    public ResponseEntity<LeadUploadUrlResponse> createUploadUrl(
            @Valid @RequestBody LeadUploadUrlRequest request) {
        if (storageService != null) {
            try {
                String prefix = request.documentType() != null ? "tutor-applications/" + request.documentType() : "tutor-applications";
                String key = storageService.buildKey(prefix, "anon-" + UUID.randomUUID().toString().substring(0, 8), request.filename());
                var uploadUrl = storageService.generateUploadUrl(key, request.contentType(), UPLOAD_URL_TTL);
                var publicUrl = storageService.generateDownloadUrl(key, DOWNLOAD_URL_TTL);

                return ResponseEntity.ok(new LeadUploadUrlResponse(
                        uploadUrl.toString(),
                        key,
                        publicUrl.toString()
                ));
            } catch (Exception e) {
                log.warn("Failed to generate S3 presigned URL: {}", e.getMessage());
            }
        }

        String pseudoKey = "tutor-applications/anon-" + UUID.randomUUID() + "/" + request.filename();
        return ResponseEntity.ok(new LeadUploadUrlResponse(null, pseudoKey, null));
    }

    @PostMapping(value = "/upload-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RateLimited(bucket = "lead-upload", capacity = 20, refillMinutes = 15)
    public ResponseEntity<LeadUploadUrlResponse> uploadDocumentFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false) String documentType,
            HttpServletRequest request) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            LeadDocument doc = LeadDocument.builder()
                    .filename(safeFilename)
                    .contentType(contentType)
                    .fileSize(file.getSize())
                    .documentType(documentType)
                    .data(file.getBytes())
                    .build();

            LeadDocument saved = leadDocumentRepository.save(doc);

            String baseUrl = buildBaseUrl(request);
            String publicUrl = baseUrl + "/api/v1/leads/documents/" + saved.getId() + "/" + safeFilename;
            String fileKey = "documents/" + saved.getId() + "/" + safeFilename;

            log.info("Uploaded lead document id={} ({}, {} bytes) -> {}", saved.getId(), safeFilename, file.getSize(), publicUrl);

            return ResponseEntity.ok(new LeadUploadUrlResponse(
                    null,
                    fileKey,
                    publicUrl
            ));
        } catch (Exception e) {
            log.error("Failed to upload document file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/documents/{id}/{filename}")
    public ResponseEntity<byte[]> getDocument(
            @PathVariable UUID id,
            @PathVariable String filename) {
        return leadDocumentRepository.findById(id)
                .map(doc -> {
                    MediaType mediaType;
                    try {
                        mediaType = MediaType.parseMediaType(doc.getContentType());
                    } catch (Exception e) {
                        mediaType = MediaType.APPLICATION_OCTET_STREAM;
                    }

                    return ResponseEntity.ok()
                            .contentType(mediaType)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFilename() + "\"")
                            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                            .body(doc.getData());
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
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

    private String buildBaseUrl(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        if (forwardedHost != null && !forwardedHost.isBlank()) {
            String scheme = (forwardedProto != null && !forwardedProto.isBlank()) ? forwardedProto : "https";
            return scheme + "://" + forwardedHost;
        }
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int port = request.getServerPort();
        if (("http".equals(scheme) && port == 80) || ("https".equals(scheme) && port == 443)) {
            return scheme + "://" + serverName;
        }
        return scheme + "://" + serverName + ":" + port;
    }
}
