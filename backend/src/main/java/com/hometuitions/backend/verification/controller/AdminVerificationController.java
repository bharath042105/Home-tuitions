package com.hometuitions.backend.verification.controller;

import com.hometuitions.backend.common.storage.StorageService;
import com.hometuitions.backend.verification.dto.AdminTutorDocumentResponse;
import com.hometuitions.backend.verification.dto.DecideDocumentRequest;
import com.hometuitions.backend.verification.entity.TutorDocument;
import com.hometuitions.backend.verification.service.VerificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/verifications")
@Tag(name = "Admin - Verification")
public class AdminVerificationController {

    private static final Duration DOWNLOAD_URL_TTL = Duration.ofMinutes(10);

    private final VerificationService verificationService;
    private final StorageService storageService;

    public AdminVerificationController(VerificationService verificationService, StorageService storageService) {
        this.verificationService = verificationService;
        this.storageService = storageService;
    }

    @GetMapping("/pending")
    public List<AdminTutorDocumentResponse> listPending() {
        return verificationService.listPending().stream().map(this::toAdminResponse).toList();
    }

    @PostMapping("/{documentId}/decision")
    public AdminTutorDocumentResponse decide(Authentication authentication,
                                              @PathVariable UUID documentId,
                                              @Valid @RequestBody DecideDocumentRequest request) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        var document = verificationService.decide(documentId, adminUserId, request.approve(), request.rejectReason());
        return toAdminResponse(document);
    }

    private AdminTutorDocumentResponse toAdminResponse(TutorDocument doc) {
        String downloadUrl = storageService.generateDownloadUrl(doc.getS3Key(), DOWNLOAD_URL_TTL).toString();
        return new AdminTutorDocumentResponse(
                doc.getId(), doc.getTutorId(), doc.getDocType(), doc.getStatus(), downloadUrl, doc.getSubmittedAt());
    }
}
