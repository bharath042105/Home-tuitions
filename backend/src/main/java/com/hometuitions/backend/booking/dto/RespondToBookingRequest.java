package com.hometuitions.backend.booking.dto;

import jakarta.validation.constraints.NotNull;

public record RespondToBookingRequest(@NotNull Action action) {
    public enum Action { ACCEPT, REJECT }
}
