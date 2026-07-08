package com.hometuitions.backend.user.dto;

import com.hometuitions.backend.user.entity.ParentProfile;

import java.util.UUID;

public record ParentProfileResponse(UUID id, UUID userId, String displayName) {
    public static ParentProfileResponse from(ParentProfile profile) {
        return new ParentProfileResponse(profile.getId(), profile.getUserId(), profile.getDisplayName());
    }
}
