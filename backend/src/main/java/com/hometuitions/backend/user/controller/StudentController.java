package com.hometuitions.backend.user.controller;

import com.hometuitions.backend.user.dto.StudentProfileRequest;
import com.hometuitions.backend.user.dto.StudentProfileResponse;
import com.hometuitions.backend.user.service.StudentProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students")
@Tag(name = "Student Profile")
public class StudentController {

    private final StudentProfileService studentProfileService;

    public StudentController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/me")
    public StudentProfileResponse getOwnProfile(Authentication authentication) {
        var profile = studentProfileService.getByUserId(UUID.fromString(authentication.getName()));
        return StudentProfileResponse.from(profile);
    }

    @PutMapping("/me")
    public StudentProfileResponse updateOwnProfile(Authentication authentication,
                                                    @Valid @RequestBody StudentProfileRequest request) {
        var profile = studentProfileService.createOrUpdate(UUID.fromString(authentication.getName()), request);
        return StudentProfileResponse.from(profile);
    }
}
