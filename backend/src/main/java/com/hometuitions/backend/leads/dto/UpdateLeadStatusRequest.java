package com.hometuitions.backend.leads.dto;

import com.hometuitions.backend.leads.entity.LeadStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateLeadStatusRequest(@NotNull LeadStatus status) {
}
