package com.hometuitions.backend.classroom.controller;

import com.hometuitions.backend.classroom.dto.DisputeResponse;
import com.hometuitions.backend.classroom.dto.ResolveDisputeRequest;
import com.hometuitions.backend.classroom.service.DisputeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/disputes")
@Tag(name = "Admin - Disputes")
public class AdminDisputeController {

    private final DisputeService disputeService;

    public AdminDisputeController(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    @GetMapping
    public List<DisputeResponse> listOpen() {
        return disputeService.listOpen().stream().map(DisputeResponse::from).toList();
    }

    @PostMapping("/{bookingId}/resolve")
    public DisputeResponse resolve(Authentication authentication,
                                    @PathVariable UUID bookingId,
                                    @Valid @RequestBody ResolveDisputeRequest request) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        var dispute = disputeService.resolve(bookingId, adminUserId, request.resolution(), request.note());
        return DisputeResponse.from(dispute);
    }
}
