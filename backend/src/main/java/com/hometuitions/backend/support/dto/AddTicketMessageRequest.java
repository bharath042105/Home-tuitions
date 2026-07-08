package com.hometuitions.backend.support.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddTicketMessageRequest(@NotBlank @Size(max = 5000) String body) {
}
