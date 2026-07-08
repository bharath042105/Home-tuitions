package com.hometuitions.backend.verification.dto;

import jakarta.validation.constraints.NotNull;

public record DecideDocumentRequest(@NotNull Boolean approve, String rejectReason) {
}
