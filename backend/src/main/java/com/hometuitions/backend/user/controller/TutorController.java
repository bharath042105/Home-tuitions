package com.hometuitions.backend.user.controller;

import com.hometuitions.backend.user.dto.TutorProfileRequest;
import com.hometuitions.backend.user.dto.TutorProfileResponse;
import com.hometuitions.backend.user.service.TutorProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutors")
@Tag(name = "Tutor Profile")
public class TutorController {

    private final TutorProfileService tutorProfileService;

    public TutorController(TutorProfileService tutorProfileService) {
        this.tutorProfileService = tutorProfileService;
    }

    @GetMapping("/me")
    public TutorProfileResponse getOwnProfile(Authentication authentication) {
        var profile = tutorProfileService.getByUserId(UUID.fromString(authentication.getName()));
        return TutorProfileResponse.from(profile);
    }

    @PutMapping("/me")
    public TutorProfileResponse updateOwnProfile(Authentication authentication,
                                                  @Valid @RequestBody TutorProfileRequest request) {
        var profile = tutorProfileService.createOrUpdate(UUID.fromString(authentication.getName()), request);
        return TutorProfileResponse.from(profile);
    }

    @GetMapping("/{id}/profile")
    public TutorProfileResponse getPublicProfile(@PathVariable UUID id) {
        // Public endpoint (see SecurityConfig permitAll list) - callers only ever get
        // back what TutorProfileResponse exposes, which excludes verification documents
        // and any other sensitive fields by construction.
        return TutorProfileResponse.from(tutorProfileService.getById(id));
    }
}
