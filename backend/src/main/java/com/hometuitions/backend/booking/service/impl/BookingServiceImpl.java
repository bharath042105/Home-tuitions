package com.hometuitions.backend.booking.service.impl;

import com.hometuitions.backend.booking.dto.RespondToBookingRequest;
import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.event.BookingAcceptedEvent;
import com.hometuitions.backend.booking.event.BookingCancelledEvent;
import com.hometuitions.backend.booking.event.BookingRejectedEvent;
import com.hometuitions.backend.booking.event.BookingRequestedEvent;
import com.hometuitions.backend.booking.event.SessionCompletedEvent;
import com.hometuitions.backend.booking.repository.BookingRepository;
import com.hometuitions.backend.booking.service.AvailabilityService;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.booking.service.BookingStateMachine;
import com.hometuitions.backend.common.audit.AuditLogService;
import com.hometuitions.backend.common.exception.ConflictException;
import com.hometuitions.backend.user.entity.ParentProfile;
import com.hometuitions.backend.user.entity.StudentProfile;
import com.hometuitions.backend.user.entity.TutorProfile;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import com.hometuitions.backend.user.service.TutorProfileService;
import io.hypersistence.utils.hibernate.type.range.Range;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final Duration PAYMENT_WINDOW = Duration.ofMinutes(30);

    private final BookingRepository bookingRepository;
    private final BookingStateMachine stateMachine;
    private final TutorProfileService tutorProfileService;
    private final StudentProfileService studentProfileService;
    private final ParentProfileService parentProfileService;
    private final AvailabilityService availabilityService;
    private final AuditLogService auditLogService;
    private final ApplicationEventPublisher eventPublisher;

    public BookingServiceImpl(BookingRepository bookingRepository,
                               BookingStateMachine stateMachine,
                               TutorProfileService tutorProfileService,
                               StudentProfileService studentProfileService,
                               ParentProfileService parentProfileService,
                               AvailabilityService availabilityService,
                               AuditLogService auditLogService,
                               ApplicationEventPublisher eventPublisher) {
        this.bookingRepository = bookingRepository;
        this.stateMachine = stateMachine;
        this.tutorProfileService = tutorProfileService;
        this.studentProfileService = studentProfileService;
        this.parentProfileService = parentProfileService;
        this.availabilityService = availabilityService;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public Booking createRequest(UUID studentProfileId, UUID parentProfileId, UUID tutorProfileId,
                                  String subject, OffsetDateTime start, OffsetDateTime end, Booking.Mode mode) {
        if (!end.isAfter(start)) {
            throw new ConflictException("endTime must be after startTime");
        }

        TutorProfile tutor = tutorProfileService.getById(tutorProfileId);
        if (tutor.getVerificationStatus() != TutorProfile.VerificationStatus.VERIFIED) {
            throw new ConflictException("This tutor is not yet verified and cannot receive bookings");
        }
        if (tutor.getTeachingMode() != TutorProfile.TeachingMode.BOTH
                && !tutor.getTeachingMode().name().equals(mode.name())) {
            throw new ConflictException("This tutor does not offer " + mode + " sessions");
        }
        assertWithinAvailability(tutorProfileId, start, end);

        Booking booking = new Booking();
        booking.setStudentId(studentProfileId);
        booking.setParentId(parentProfileId);
        booking.setTutorId(tutorProfileId);
        booking.setSubject(subject);
        booking.setMode(mode);
        booking.setTimeRange(Range.closedOpen(start, end));
        booking.setStatus(BookingStatus.PENDING_TUTOR_ACTION);

        Booking saved = bookingRepository.save(booking);
        String actor = parentProfileId != null ? parentProfileId.toString() : studentProfileId.toString();
        auditLogService.record(actor, "BOOKING_REQUESTED", saved.getId().toString(),
                Map.of("tutorId", tutorProfileId.toString()));
        eventPublisher.publishEvent(new BookingRequestedEvent(saved.getId(), tutorProfileId));
        return saved;
    }

    @Override
    public Booking respond(UUID bookingId, UUID tutorProfileId, RespondToBookingRequest.Action action, String actorUserId) {
        Booking booking = getOrThrow(bookingId);
        if (!booking.getTutorId().equals(tutorProfileId)) {
            throw new AccessDeniedException("This booking does not belong to you");
        }

        if (action == RespondToBookingRequest.Action.ACCEPT) {
            stateMachine.transition(booking, BookingStatus.PENDING_PAYMENT, actorUserId);
            booking.setPaymentDeadline(Instant.now().plus(PAYMENT_WINDOW));
            Booking saved = bookingRepository.save(booking);

            TutorProfile tutor = tutorProfileService.getById(tutorProfileId);
            BigDecimal hours = BigDecimal.valueOf(Duration.between(saved.startTime(), saved.endTime()).toMinutes())
                    .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
            BigDecimal amount = tutor.getHourlyRate().multiply(hours).setScale(2, RoundingMode.HALF_UP);
            eventPublisher.publishEvent(new BookingAcceptedEvent(saved.getId(), tutorProfileId, amount));

            return saved;
        }

        stateMachine.transition(booking, BookingStatus.REJECTED, actorUserId);
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingRejectedEvent(bookingId, saved.getStudentId(), saved.getParentId()));
        return saved;
    }

    @Override
    public Booking cancel(UUID bookingId, String actorUserId) {
        Booking booking = getOrThrow(bookingId);
        UUID actor = UUID.fromString(actorUserId);
        if (!isAuthorizedToCancel(booking, actor)) { // already-fetched booking - avoid a redundant re-fetch
            throw new AccessDeniedException("You cannot cancel this booking");
        }
        stateMachine.transition(booking, BookingStatus.CANCELLED, actorUserId);
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingCancelledEvent(bookingId, booking.getTutorId()));
        return saved;
    }

    @Override
    public Booking confirmPayment(UUID bookingId) {
        Booking booking = getOrThrow(bookingId);
        stateMachine.transition(booking, BookingStatus.CONFIRMED, "system");
        return bookingRepository.save(booking);
    }

    @Override
    public Booking completeSession(UUID bookingId) {
        Booking booking = getOrThrow(bookingId);
        stateMachine.transition(booking, BookingStatus.COMPLETED, "system");
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new SessionCompletedEvent(bookingId, booking.getTutorId()));
        return saved;
    }

    @Override
    public Booking markMutualNoShow(UUID bookingId) {
        Booking booking = getOrThrow(bookingId);
        stateMachine.transition(booking, BookingStatus.CANCELLED, "system");
        Booking saved = bookingRepository.save(booking);
        // Reuses the same event a user-initiated cancel publishes, so the existing
        // refund/notification listeners fire without a parallel no-show-specific path.
        eventPublisher.publishEvent(new BookingCancelledEvent(bookingId, booking.getTutorId()));
        return saved;
    }

    @Override
    public Booking markDisputed(UUID bookingId) {
        Booking booking = getOrThrow(bookingId);
        stateMachine.transition(booking, BookingStatus.DISPUTED, "system");
        return bookingRepository.save(booking);
    }

    @Override
    public Booking getById(UUID bookingId) {
        return getOrThrow(bookingId);
    }

    @Override
    public boolean isParticipant(UUID bookingId, UUID userId) {
        return isAuthorizedToCancel(getOrThrow(bookingId), userId);
    }

    @Override
    public List<Booking> listForStudent(UUID studentProfileId) {
        return bookingRepository.findByStudentIdOrderByCreatedAtDesc(studentProfileId);
    }

    @Override
    public List<Booking> listForTutor(UUID tutorProfileId) {
        return bookingRepository.findByTutorIdOrderByCreatedAtDesc(tutorProfileId);
    }

    @Override
    public List<Booking> listForStudents(List<UUID> studentProfileIds) {
        return bookingRepository.findByStudentIdInOrderByCreatedAtDesc(studentProfileIds);
    }

    @Override
    public List<Booking> listAll(BookingStatus statusFilter) {
        return statusFilter != null
                ? bookingRepository.findByStatusOrderByCreatedAtDesc(statusFilter)
                : bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public long countAll() {
        return bookingRepository.count();
    }

    private Booking getOrThrow(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
    }

    private boolean isAuthorizedToCancel(Booking booking, UUID actorUserId) {
        StudentProfile student = studentProfileService.getById(booking.getStudentId());
        if (actorUserId.equals(student.getUserId())) {
            return true;
        }
        if (booking.getParentId() != null) {
            ParentProfile parent = parentProfileService.getById(booking.getParentId());
            if (actorUserId.equals(parent.getUserId())) {
                return true;
            }
        }
        TutorProfile tutor = tutorProfileService.getById(booking.getTutorId());
        return actorUserId.equals(tutor.getUserId());
    }

    private void assertWithinAvailability(UUID tutorProfileId, OffsetDateTime start, OffsetDateTime end) {
        int dayOfWeek = start.getDayOfWeek().getValue() % 7; // Mon=1..Sat=6, Sun=7%7=0 - matches schema's 0=Sunday convention
        boolean fitsSomeRule = availabilityService.listForTutor(tutorProfileId).stream()
                .filter(rule -> rule.getDayOfWeek() == dayOfWeek)
                .anyMatch(rule -> !start.toLocalTime().isBefore(rule.getStartTime())
                        && !end.toLocalTime().isAfter(rule.getEndTime()));
        if (!fitsSomeRule) {
            throw new ConflictException("Requested time is outside this tutor's declared availability");
        }
    }
}
