package com.hometuitions.backend.leads.dto;

public record LeadUploadUrlResponse(
        String uploadUrl,
        String key,
        String publicUrl
) {
}
