package com.hometuitions.backend.verification.controller;

import com.hometuitions.backend.user.service.TutorProfileService;
import com.hometuitions.backend.verification.dto.SubmitDocumentRequest;
import com.hometuitions.backend.verification.dto.TutorDocumentResponse;
import com.hometuitions.backend.verification.dto.UploadUrlRequest;
import com.hometuitions.backend.verification.dto.UploadUrlResponse;
import com.hometuitions.backend.verification.service.VerificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutors/me/documents")
@Tag(name = "Tutor Verification")
public class TutorVerificationController {

    private final VerificationService verificationService;
    private final TutorProfileService tutorProfileService;

    public TutorVerificationController(VerificationService verificationService,
                                        TutorProfileService tutorProfileService) {
        this.verificationService = verificationService;
        this.tutorProfileService = tutorProfileService;
    }

    @PostMapping("/upload-url")
    public UploadUrlResponse createUploadUrl(Authentication authentication,
                                              @Valid @RequestBody UploadUrlRequest request) {
        UUID tutorProfileId = ownTutorProfileId(authentication);
        return verificationService.createUploadUrl(tutorProfileId, request);
    }

    @PostMapping
    public ResponseEntity<TutorDocumentResponse> submitDocument(Authentication authentication,
                                                                 @Valid @RequestBody SubmitDocumentRequest request) {
        UUID tutorProfileId = ownTutorProfileId(authentication);
        var document = verificationService.submitDocument(tutorProfileId, request.docType(), request.s3Key());
        return ResponseEntity.status(HttpStatus.CREATED).body(TutorDocumentResponse.from(document));
    }

    @GetMapping
    public List<TutorDocumentResponse> listOwnDocuments(Authentication authentication) {
        UUID tutorProfileId = ownTutorProfileId(authentication);
        return verificationService.listForTutor(tutorProfileId).stream()
                .map(TutorDocumentResponse::from)
                .toList();
    }

    private UUID ownTutorProfileId(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return tutorProfileService.getByUserId(userId).getId();
    }
}
