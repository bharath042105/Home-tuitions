package com.hometuitions.backend.admin.dto;

import java.math.BigDecimal;

public record AdminAnalyticsResponse(
        long totalStudents,
        long totalParents,
        long totalTutors,
        long pendingVerifications,
        long totalBookings,
        long openDisputes,
        long openTickets,
        BigDecimal totalRevenueReleased
) {
}
