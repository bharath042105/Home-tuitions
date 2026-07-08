package com.hometuitions.backend.support.controller;

import com.hometuitions.backend.support.dto.AddTicketMessageRequest;
import com.hometuitions.backend.support.dto.RaiseTicketRequest;
import com.hometuitions.backend.support.dto.SupportTicketResponse;
import com.hometuitions.backend.support.dto.TicketMessageResponse;
import com.hometuitions.backend.support.service.SupportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@Tag(name = "Support Tickets")
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @GetMapping("/me")
    public List<SupportTicketResponse> listOwn(Authentication authentication) {
        return supportService.listOwn(UUID.fromString(authentication.getName())).stream()
                .map(SupportTicketResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<SupportTicketResponse> raise(Authentication authentication,
                                                        @Valid @RequestBody RaiseTicketRequest request) {
        var ticket = supportService.raiseTicket(
                UUID.fromString(authentication.getName()), request.subject(), request.message());
        return ResponseEntity.status(HttpStatus.CREATED).body(SupportTicketResponse.from(ticket));
    }

    @GetMapping("/{id}/messages")
    public List<TicketMessageResponse> listMessages(Authentication authentication, @PathVariable UUID id) {
        UUID userId = UUID.fromString(authentication.getName());
        return supportService.listMessages(id, userId, false).stream()
                .map(TicketMessageResponse::from)
                .toList();
    }

    @PostMapping("/{id}/messages")
    public TicketMessageResponse addMessage(Authentication authentication,
                                             @PathVariable UUID id,
                                             @Valid @RequestBody AddTicketMessageRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        var message = supportService.addMessage(id, userId, request.body(), false);
        return TicketMessageResponse.from(message);
    }
}
