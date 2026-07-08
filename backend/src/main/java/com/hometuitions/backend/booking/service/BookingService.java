package com.hometuitions.backend.booking.service;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.Booking.Mode;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.dto.RespondToBookingRequest;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface BookingService {

    /** studentProfileId/parentProfileId are already resolved+authorized by the controller -
     *  this method only enforces business rules (tutor verified, mode compatible,
     *  slot within tutor availability), not who's allowed to book for whom. */
    Booking createRequest(UUID studentProfileId, UUID parentProfileId, UUID tutorProfileId,
                           String subject, OffsetDateTime start, OffsetDateTime end, Mode mode);

    Booking respond(UUID bookingId, UUID tutorProfileId, RespondToBookingRequest.Action action, String actorUserId);

    Booking cancel(UUID bookingId, String actorUserId);

    /** Called by the payment module once a webhook confirms capture - transitions
     *  PENDING_PAYMENT -> CONFIRMED. Returns the booking so the caller (which needs
     *  tutorId/amount for its own ledger entry) doesn't have to re-fetch it. */
    Booking confirmPayment(UUID bookingId);

    /** Called by the classroom (offline attendance) module once both sides mark PRESENT -
     *  transitions CONFIRMED -> COMPLETED. */
    Booking completeSession(UUID bookingId);

    /** Called by the classroom module once both sides mark ABSENT (mutual no-show) -
     *  transitions CONFIRMED -> CANCELLED, same as a normal cancellation so the existing
     *  BookingCancelledEvent listeners (refund, notification) fire without duplication. */
    Booking markMutualNoShow(UUID bookingId);

    /** Called by the classroom module when attendance marks disagree - transitions
     *  CONFIRMED -> DISPUTED. Admin resolution (Phase 14) will call completeSession or
     *  markMutualNoShow afterward depending on how the dispute is decided. */
    Booking markDisputed(UUID bookingId);

    Booking getById(UUID bookingId);

    /** Is this user (by userId, not profile id) the student, managing parent, or
     *  tutor on this booking? Shared by cancel()'s authorization check and by other
     *  modules (payment) that expose booking-scoped data and need the same check. */
    boolean isParticipant(UUID bookingId, UUID userId);

    List<Booking> listForStudent(UUID studentProfileId);

    List<Booking> listForTutor(UUID tutorProfileId);

    List<Booking> listForStudents(List<UUID> studentProfileIds);

    /** Admin-facing (SRS FR-11.3): every booking, optionally filtered by status. */
    List<Booking> listAll(BookingStatus statusFilter);

    long countAll();
}
