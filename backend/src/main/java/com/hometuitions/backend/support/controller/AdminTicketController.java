package com.hometuitions.backend.support.controller;

import com.hometuitions.backend.support.dto.AddTicketMessageRequest;
import com.hometuitions.backend.support.dto.SupportTicketResponse;
import com.hometuitions.backend.support.dto.TicketMessageResponse;
import com.hometuitions.backend.support.entity.SupportTicket;
import com.hometuitions.backend.support.service.SupportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/tickets")
@Tag(name = "Admin - Support Tickets")
public class AdminTicketController {

    private final SupportService supportService;

    public AdminTicketController(SupportService supportService) {
        this.supportService = supportService;
    }

    @GetMapping
    public List<SupportTicketResponse> list(@RequestParam(required = false) SupportTicket.Status status) {
        return supportService.listAll(status).stream().map(SupportTicketResponse::from).toList();
    }

    @GetMapping("/{id}/messages")
    public List<TicketMessageResponse> listMessages(@PathVariable UUID id) {
        // isAdmin=true - the calling method's own userId isn't checked against
        // ticket.raisedBy for an admin, only used as the sender id when replying.
        return supportService.listMessages(id, null, true).stream().map(TicketMessageResponse::from).toList();
    }

    @PostMapping("/{id}/messages")
    public TicketMessageResponse reply(Authentication authentication,
                                        @PathVariable UUID id,
                                        @Valid @RequestBody AddTicketMessageRequest request) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        var message = supportService.addMessage(id, adminUserId, request.body(), true);
        return TicketMessageResponse.from(message);
    }

    @PostMapping("/{id}/close")
    public SupportTicketResponse close(@PathVariable UUID id) {
        return SupportTicketResponse.from(supportService.updateStatus(id, SupportTicket.Status.CLOSED));
    }
}
