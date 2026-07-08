package com.hometuitions.backend.auth.dto;

import com.hometuitions.backend.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email String email,
        @Size(min = 8, max = 100) String password,
        @NotNull User.Role role
) {
}
