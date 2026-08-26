package com.hometuitions.backend.leads.controller;

import com.hometuitions.backend.leads.dto.ContactMessageResponse;
import com.hometuitions.backend.leads.dto.TuitionInquiryResponse;
import com.hometuitions.backend.leads.dto.TutorApplicationResponse;
import com.hometuitions.backend.leads.dto.UpdateLeadStatusRequest;
import com.hometuitions.backend.leads.service.LeadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/leads")
@Tag(name = "Admin - Leads")
public class AdminLeadController {

    private final LeadService leadService;

    public AdminLeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping("/tuition-inquiries")
    public Page<TuitionInquiryResponse> listTuitionInquiries(Pageable pageable) {
        return leadService.listTuitionInquiries(pageable).map(TuitionInquiryResponse::from);
    }

    @PostMapping("/tuition-inquiries/{id}/status")
    public TuitionInquiryResponse updateTuitionInquiryStatus(@PathVariable UUID id,
                                                              @Valid @RequestBody UpdateLeadStatusRequest request) {
        return TuitionInquiryResponse.from(leadService.updateTuitionInquiryStatus(id, request.status()));
    }

    @GetMapping("/tutor-applications")
    public Page<TutorApplicationResponse> listTutorApplications(Pageable pageable) {
        return leadService.listTutorApplications(pageable).map(TutorApplicationResponse::from);
    }

    @PostMapping("/tutor-applications/{id}/status")
    public TutorApplicationResponse updateTutorApplicationStatus(@PathVariable UUID id,
                                                                  @Valid @RequestBody UpdateLeadStatusRequest request) {
        return TutorApplicationResponse.from(leadService.updateTutorApplicationStatus(id, request.status()));
    }

    @GetMapping("/contact-messages")
    public Page<ContactMessageResponse> listContactMessages(Pageable pageable) {
        return leadService.listContactMessages(pageable).map(ContactMessageResponse::from);
    }

    @PostMapping("/contact-messages/{id}/status")
    public ContactMessageResponse updateContactMessageStatus(@PathVariable UUID id,
                                                               @Valid @RequestBody UpdateLeadStatusRequest request) {
        return ContactMessageResponse.from(leadService.updateContactMessageStatus(id, request.status()));
    }
}
