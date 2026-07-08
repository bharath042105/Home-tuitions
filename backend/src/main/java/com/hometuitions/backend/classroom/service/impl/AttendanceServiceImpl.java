package com.hometuitions.backend.classroom.service.impl;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.classroom.entity.AttendanceRecord;
import com.hometuitions.backend.classroom.repository.AttendanceRecordRepository;
import com.hometuitions.backend.classroom.service.AttendanceService;
import com.hometuitions.backend.classroom.service.DisputeService;
import com.hometuitions.backend.common.exception.ConflictException;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import com.hometuitions.backend.user.service.TutorProfileService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final DisputeService disputeService;
    private final BookingService bookingService;
    private final TutorProfileService tutorProfileService;
    private final StudentProfileService studentProfileService;
    private final ParentProfileService parentProfileService;

    public AttendanceServiceImpl(AttendanceRecordRepository attendanceRepository,
                                  DisputeService disputeService,
                                  BookingService bookingService,
                                  TutorProfileService tutorProfileService,
                                  StudentProfileService studentProfileService,
                                  ParentProfileService parentProfileService) {
        this.attendanceRepository = attendanceRepository;
        this.disputeService = disputeService;
        this.bookingService = bookingService;
        this.tutorProfileService = tutorProfileService;
        this.studentProfileService = studentProfileService;
        this.parentProfileService = parentProfileService;
    }

    @Override
    public AttendanceRecord markAttendance(UUID bookingId, UUID callerUserId, AttendanceRecord.Status status) {
        Booking booking = bookingService.getById(bookingId);

        if (booking.getMode() != Booking.Mode.OFFLINE) {
            throw new ConflictException("Attendance marking only applies to offline sessions");
        }
        if (booking.getStatus() != com.hometuitions.backend.booking.entity.BookingStatus.CONFIRMED) {
            throw new ConflictException("Attendance can only be marked for a confirmed session");
        }
        if (!bookingService.isParticipant(bookingId, callerUserId)) {
            throw new AccessDeniedException("You are not a participant of this booking");
        }

        AttendanceRecord record = attendanceRepository.findByBookingIdAndMarkedBy(bookingId, callerUserId)
                .orElseGet(AttendanceRecord::new);
        record.setBookingId(bookingId);
        record.setMarkedBy(callerUserId);
        record.setStatus(status);
        record.setMarkedAt(Instant.now());
        AttendanceRecord saved = attendanceRepository.save(record);

        reconcileIfBothSidesRecorded(booking);
        return saved;
    }

    @Override
    public List<AttendanceRecord> listForBooking(UUID bookingId, UUID callerUserId) {
        if (!bookingService.isParticipant(bookingId, callerUserId)) {
            throw new AccessDeniedException("You are not a participant of this booking");
        }
        return attendanceRepository.findByBookingId(bookingId);
    }

    @Override
    public void autoConfirmMissingSide(UUID bookingId) {
        Booking booking = bookingService.getById(bookingId);
        UUID tutorUserId = tutorProfileService.getById(booking.getTutorId()).getUserId();
        UUID payerUserId = booking.getParentId() != null
                ? parentProfileService.getById(booking.getParentId()).getUserId()
                : studentProfileService.getById(booking.getStudentId()).getUserId();

        Optional<AttendanceRecord> tutorMark = attendanceRepository.findByBookingIdAndMarkedBy(bookingId, tutorUserId);
        Optional<AttendanceRecord> payerMark = attendanceRepository.findByBookingIdAndMarkedBy(bookingId, payerUserId);

        boolean exactlyOneRecorded = tutorMark.isPresent() ^ payerMark.isPresent();
        if (!exactlyOneRecorded) {
            return; // neither side recorded, or both already did (and were already reconciled) - nothing to do
        }

        UUID missingSideUserId = tutorMark.isEmpty() ? tutorUserId : payerUserId;
        AttendanceRecord autoRecord = new AttendanceRecord();
        autoRecord.setBookingId(bookingId);
        autoRecord.setMarkedBy(missingSideUserId);
        autoRecord.setStatus(AttendanceRecord.Status.PRESENT);
        attendanceRepository.save(autoRecord);

        reconcileIfBothSidesRecorded(booking);
    }

    /** Once both the tutor side and the payer side have recorded a mark, resolves the
     *  booking: matching PRESENT completes it (and releases payment), matching ABSENT
     *  is a mutual no-show (cancelled, refunded), a mismatch opens a dispute for admin. */
    private void reconcileIfBothSidesRecorded(Booking booking) {
        UUID tutorUserId = tutorProfileService.getById(booking.getTutorId()).getUserId();
        UUID payerUserId = booking.getParentId() != null
                ? parentProfileService.getById(booking.getParentId()).getUserId()
                : studentProfileService.getById(booking.getStudentId()).getUserId();

        Optional<AttendanceRecord> tutorMark = attendanceRepository.findByBookingIdAndMarkedBy(booking.getId(), tutorUserId);
        Optional<AttendanceRecord> payerMark = attendanceRepository.findByBookingIdAndMarkedBy(booking.getId(), payerUserId);
        if (tutorMark.isEmpty() || payerMark.isEmpty()) {
            return; // only one side has marked so far - nothing to reconcile yet
        }

        if (tutorMark.get().getStatus() == payerMark.get().getStatus()) {
            if (tutorMark.get().getStatus() == AttendanceRecord.Status.PRESENT) {
                bookingService.completeSession(booking.getId());
            } else {
                bookingService.markMutualNoShow(booking.getId());
            }
        } else {
            String reason = "Attendance mismatch: tutor marked %s, student/parent marked %s"
                    .formatted(tutorMark.get().getStatus(), payerMark.get().getStatus());
            disputeService.create(booking.getId(), reason);
            bookingService.markDisputed(booking.getId());
        }
    }
}
