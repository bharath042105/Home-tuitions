package com.hometuitions.backend.user.controller;

import com.hometuitions.backend.user.dto.ParentProfileRequest;
import com.hometuitions.backend.user.dto.ParentProfileResponse;
import com.hometuitions.backend.user.dto.StudentProfileRequest;
import com.hometuitions.backend.user.dto.StudentProfileResponse;
import com.hometuitions.backend.user.service.ParentProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/parents")
@Tag(name = "Parent Profile")
public class ParentController {

    private final ParentProfileService parentProfileService;

    public ParentController(ParentProfileService parentProfileService) {
        this.parentProfileService = parentProfileService;
    }

    @GetMapping("/me")
    public ParentProfileResponse getOwnProfile(Authentication authentication) {
        return ParentProfileResponse.from(parentProfileService.getByUserId(userId(authentication)));
    }

    @PutMapping("/me")
    public ParentProfileResponse updateOwnProfile(Authentication authentication,
                                                   @Valid @RequestBody ParentProfileRequest request) {
        return ParentProfileResponse.from(parentProfileService.createOrUpdate(userId(authentication), request));
    }

    @GetMapping("/me/children")
    public List<StudentProfileResponse> listChildren(Authentication authentication) {
        return parentProfileService.listChildren(userId(authentication)).stream()
                .map(StudentProfileResponse::from)
                .toList();
    }

    @PostMapping("/me/children")
    public ResponseEntity<StudentProfileResponse> addChild(Authentication authentication,
                                                            @Valid @RequestBody StudentProfileRequest request) {
        var child = parentProfileService.addChild(userId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(StudentProfileResponse.from(child));
    }

    @PutMapping("/me/children/{studentProfileId}")
    public StudentProfileResponse updateChild(Authentication authentication,
                                               @PathVariable UUID studentProfileId,
                                               @Valid @RequestBody StudentProfileRequest request) {
        var child = parentProfileService.updateChild(userId(authentication), studentProfileId, request);
        return StudentProfileResponse.from(child);
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
