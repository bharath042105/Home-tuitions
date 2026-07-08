package com.hometuitions.backend.classroom.service.impl;

import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.classroom.entity.Dispute;
import com.hometuitions.backend.classroom.repository.DisputeRepository;
import com.hometuitions.backend.classroom.service.DisputeService;
import com.hometuitions.backend.common.audit.AuditLogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final BookingService bookingService;
    private final AuditLogService auditLogService;

    public DisputeServiceImpl(DisputeRepository disputeRepository,
                               BookingService bookingService,
                               AuditLogService auditLogService) {
        this.disputeRepository = disputeRepository;
        this.bookingService = bookingService;
        this.auditLogService = auditLogService;
    }

    @Override
    public Dispute create(UUID bookingId, String reason) {
        Dispute dispute = new Dispute();
        dispute.setBookingId(bookingId);
        dispute.setReason(reason);
        return disputeRepository.save(dispute);
    }

    @Override
    public List<Dispute> listOpen() {
        return disputeRepository.findByStatus(Dispute.Status.OPEN);
    }

    @Override
    public Dispute resolve(UUID bookingId, UUID adminUserId, Resolution resolution, String note) {
        Dispute dispute = disputeRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("No dispute for this booking"));

        if (resolution == Resolution.COMPLETE_AND_PAY) {
            bookingService.completeSession(bookingId);
        } else {
            bookingService.markMutualNoShow(bookingId);
        }

        dispute.setStatus(Dispute.Status.RESOLVED);
        dispute.setResolution(note);
        dispute.setResolvedBy(adminUserId);
        dispute.setResolvedAt(Instant.now());
        Dispute saved = disputeRepository.save(dispute);

        auditLogService.record(adminUserId.toString(), "DISPUTE_RESOLVED", bookingId.toString(),
                Map.of("resolution", resolution.name()));
        return saved;
    }
}
