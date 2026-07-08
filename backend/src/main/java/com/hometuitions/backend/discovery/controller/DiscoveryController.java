package com.hometuitions.backend.discovery.controller;

import com.hometuitions.backend.discovery.dto.TutorSearchRequest;
import com.hometuitions.backend.discovery.dto.TutorSearchResult;
import com.hometuitions.backend.discovery.service.SearchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tutors/search")
@Tag(name = "Tutor Discovery")
public class DiscoveryController {

    private final SearchService searchService;

    public DiscoveryController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public Page<TutorSearchResult> search(@Valid @ModelAttribute TutorSearchRequest request) {
        // Public endpoint - see SecurityConfig's "/api/v1/tutors/search/**" permitAll entry.
        // Only VERIFIED tutors are ever returned (enforced in the repository query, SRS FR-3).
        return searchService.search(request);
    }
}
