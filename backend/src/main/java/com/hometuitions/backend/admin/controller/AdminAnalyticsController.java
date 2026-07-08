package com.hometuitions.backend.admin.controller;

import com.hometuitions.backend.admin.dto.AdminAnalyticsResponse;
import com.hometuitions.backend.auth.entity.User;
import com.hometuitions.backend.auth.service.UserManagementService;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.classroom.service.DisputeService;
import com.hometuitions.backend.payment.service.PaymentService;
import com.hometuitions.backend.support.entity.SupportTicket;
import com.hometuitions.backend.support.service.SupportService;
import com.hometuitions.backend.verification.service.VerificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cross-module read-only aggregation (SRS FR-11.4) - the `admin` module reads other
 * modules exclusively through their public Service interfaces, same rule as everywhere
 * else, it just happens to touch more of them at once than any single-purpose module does.
 */
@RestController
@RequestMapping("/api/v1/admin/analytics")
@Tag(name = "Admin - Analytics")
public class AdminAnalyticsController {

    private final UserManagementService userManagementService;
    private final VerificationService verificationService;
    private final BookingService bookingService;
    private final DisputeService disputeService;
    private final SupportService supportService;
    private final PaymentService paymentService;

    public AdminAnalyticsController(UserManagementService userManagementService,
                                     VerificationService verificationService,
                                     BookingService bookingService,
                                     DisputeService disputeService,
                                     SupportService supportService,
                                     PaymentService paymentService) {
        this.userManagementService = userManagementService;
        this.verificationService = verificationService;
        this.bookingService = bookingService;
        this.disputeService = disputeService;
        this.supportService = supportService;
        this.paymentService = paymentService;
    }

    @GetMapping
    public AdminAnalyticsResponse getAnalytics() {
        return new AdminAnalyticsResponse(
                userManagementService.countByRole(User.Role.STUDENT),
                userManagementService.countByRole(User.Role.PARENT),
                userManagementService.countByRole(User.Role.TUTOR),
                verificationService.listPending().size(),
                bookingService.countAll(),
                disputeService.listOpen().size(),
                supportService.listAll(SupportTicket.Status.OPEN).size(),
                paymentService.totalRevenueReleased()
        );
    }
}
