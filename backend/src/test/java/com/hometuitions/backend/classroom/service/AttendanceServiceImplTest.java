package com.hometuitions.backend.classroom.service;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.classroom.entity.AttendanceRecord;
import com.hometuitions.backend.classroom.repository.AttendanceRecordRepository;
import com.hometuitions.backend.classroom.service.impl.AttendanceServiceImpl;
import com.hometuitions.backend.common.exception.ConflictException;
import com.hometuitions.backend.user.entity.StudentProfile;
import com.hometuitions.backend.user.entity.TutorProfile;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import com.hometuitions.backend.user.service.TutorProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * The dual-confirmation reconciliation logic (docs/phase12/README.md) is the riskiest
 * part of this module - getting "match/mismatch" wrong means either paying a tutor for
 * a session that didn't happen, or wrongly disputing one that did. Covers all three
 * reconciliation outcomes plus the OFFLINE/CONFIRMED guards.
 */
class AttendanceServiceImplTest {

    private AttendanceRecordRepository attendanceRepository;
    private DisputeService disputeService;
    private BookingService bookingService;
    private TutorProfileService tutorProfileService;
    private StudentProfileService studentProfileService;
    private ParentProfileService parentProfileService;
    private AttendanceServiceImpl attendanceService;

    private final UUID bookingId = UUID.randomUUID();
    private final UUID tutorProfileId = UUID.randomUUID();
    private final UUID studentProfileId = UUID.randomUUID();
    private final UUID tutorUserId = UUID.randomUUID();
    private final UUID studentUserId = UUID.randomUUID();

    private final Map<UUID, AttendanceRecord> store = new HashMap<>();

    @BeforeEach
    void setUp() {
        attendanceRepository = mock(AttendanceRecordRepository.class);
        disputeService = mock(DisputeService.class);
        bookingService = mock(BookingService.class);
        tutorProfileService = mock(TutorProfileService.class);
        studentProfileService = mock(StudentProfileService.class);
        parentProfileService = mock(ParentProfileService.class);
        store.clear();

        attendanceService = new AttendanceServiceImpl(
                attendanceRepository, disputeService, bookingService,
                tutorProfileService, studentProfileService, parentProfileService);

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setTutorId(tutorProfileId);
        booking.setStudentId(studentProfileId);
        booking.setParentId(null); // self-registered student, no parent
        booking.setMode(Booking.Mode.OFFLINE);
        booking.setStatus(BookingStatus.CONFIRMED);
        when(bookingService.getById(bookingId)).thenReturn(booking);
        when(bookingService.isParticipant(eq(bookingId), any())).thenReturn(true);

        TutorProfile tutor = new TutorProfile();
        tutor.setId(tutorProfileId);
        tutor.setUserId(tutorUserId);
        when(tutorProfileService.getById(tutorProfileId)).thenReturn(tutor);

        StudentProfile student = new StudentProfile();
        student.setId(studentProfileId);
        student.setUserId(studentUserId);
        when(studentProfileService.getById(studentProfileId)).thenReturn(student);

        // In-memory fake for the upsert + lookup pattern AttendanceServiceImpl relies on
        when(attendanceRepository.save(any())).thenAnswer(inv -> {
            AttendanceRecord record = inv.getArgument(0);
            if (record.getId() == null) record.setId(UUID.randomUUID());
            store.put(record.getMarkedBy(), record);
            return record;
        });
        when(attendanceRepository.findByBookingIdAndMarkedBy(eq(bookingId), any()))
                .thenAnswer(inv -> Optional.ofNullable(store.get((UUID) inv.getArgument(1))));
    }

    @Test
    void bothSidesPresent_completesTheSessionAndReleasesPayment() {
        attendanceService.markAttendance(bookingId, tutorUserId, AttendanceRecord.Status.PRESENT);
        attendanceService.markAttendance(bookingId, studentUserId, AttendanceRecord.Status.PRESENT);

        verify(bookingService).completeSession(bookingId);
        verify(bookingService, never()).markMutualNoShow(any());
        verify(bookingService, never()).markDisputed(any());
        verify(disputeService, never()).create(any(), any());
    }

    @Test
    void bothSidesAbsent_treatedAsMutualNoShow() {
        attendanceService.markAttendance(bookingId, tutorUserId, AttendanceRecord.Status.ABSENT);
        attendanceService.markAttendance(bookingId, studentUserId, AttendanceRecord.Status.ABSENT);

        verify(bookingService).markMutualNoShow(bookingId);
        verify(bookingService, never()).completeSession(any());
        verify(disputeService, never()).create(any(), any());
    }

    @Test
    void mismatchedMarks_opensADisputeInsteadOfDecidingUnilaterally() {
        attendanceService.markAttendance(bookingId, tutorUserId, AttendanceRecord.Status.PRESENT);
        attendanceService.markAttendance(bookingId, studentUserId, AttendanceRecord.Status.ABSENT);

        verify(disputeService).create(eq(bookingId), any());
        verify(bookingService).markDisputed(bookingId);
        verify(bookingService, never()).completeSession(any());
        verify(bookingService, never()).markMutualNoShow(any());
    }

    @Test
    void onlyOneSideMarked_doesNotReconcileYet() {
        attendanceService.markAttendance(bookingId, tutorUserId, AttendanceRecord.Status.PRESENT);

        verifyNoInteractions(disputeService);
        verify(bookingService, never()).completeSession(any());
        verify(bookingService, never()).markMutualNoShow(any());
        verify(bookingService, never()).markDisputed(any());
    }

    @Test
    void rejectsAttendanceMarkingForOnlineBookings() {
        Booking onlineBooking = new Booking();
        onlineBooking.setId(bookingId);
        onlineBooking.setMode(Booking.Mode.ONLINE);
        onlineBooking.setStatus(BookingStatus.CONFIRMED);
        when(bookingService.getById(bookingId)).thenReturn(onlineBooking);

        assertThatThrownBy(() -> attendanceService.markAttendance(bookingId, tutorUserId, AttendanceRecord.Status.PRESENT))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void rejectsAttendanceMarkingBeforeConfirmed() {
        Booking pendingBooking = new Booking();
        pendingBooking.setId(bookingId);
        pendingBooking.setMode(Booking.Mode.OFFLINE);
        pendingBooking.setStatus(BookingStatus.PENDING_PAYMENT);
        when(bookingService.getById(bookingId)).thenReturn(pendingBooking);

        assertThatThrownBy(() -> attendanceService.markAttendance(bookingId, tutorUserId, AttendanceRecord.Status.PRESENT))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void rejectsANonParticipantMarkingAttendance() {
        UUID strangerId = UUID.randomUUID();
        when(bookingService.isParticipant(bookingId, strangerId)).thenReturn(false);

        assertThatThrownBy(() -> attendanceService.markAttendance(bookingId, strangerId, AttendanceRecord.Status.PRESENT))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void autoConfirmMissingSide_fillsInPresentWhenOnlyOneSideMarked() {
        attendanceService.markAttendance(bookingId, tutorUserId, AttendanceRecord.Status.PRESENT);

        attendanceService.autoConfirmMissingSide(bookingId);

        assertThat(store.get(studentUserId)).isNotNull();
        assertThat(store.get(studentUserId).getStatus()).isEqualTo(AttendanceRecord.Status.PRESENT);
        verify(bookingService).completeSession(bookingId);
    }

    @Test
    void autoConfirmMissingSide_doesNothingWhenNeitherSideMarked() {
        attendanceService.autoConfirmMissingSide(bookingId);

        verify(bookingService, never()).completeSession(any());
        verify(bookingService, never()).markMutualNoShow(any());
        assertThat(store).isEmpty();
    }
}
