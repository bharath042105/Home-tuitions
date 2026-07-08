package com.hometuitions.backend.classroom.dto;

import com.hometuitions.backend.classroom.service.DisputeService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResolveDisputeRequest(@NotNull DisputeService.Resolution resolution, @NotBlank String note) {
}
