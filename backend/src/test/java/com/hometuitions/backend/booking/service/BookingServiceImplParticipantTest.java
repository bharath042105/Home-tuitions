package com.hometuitions.backend.booking.service;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.repository.BookingRepository;
import com.hometuitions.backend.booking.service.impl.BookingServiceImpl;
import com.hometuitions.backend.common.audit.AuditLogService;
import com.hometuitions.backend.user.entity.ParentProfile;
import com.hometuitions.backend.user.entity.StudentProfile;
import com.hometuitions.backend.user.entity.TutorProfile;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import com.hometuitions.backend.user.service.TutorProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * isParticipant() gates both cancel() and other modules' booking-scoped endpoints
 * (payment order details, Phase 9; chat, Phase 10; attendance, Phase 12) - a wrong
 * answer here is a cross-cutting authorization bug, not a localized one.
 */
class BookingServiceImplParticipantTest {

    private BookingRepository bookingRepository;
    private StudentProfileService studentProfileService;
    private ParentProfileService parentProfileService;
    private TutorProfileService tutorProfileService;
    private BookingServiceImpl bookingService;

    private final UUID bookingId = UUID.randomUUID();
    private final UUID studentProfileId = UUID.randomUUID();
    private final UUID parentProfileId = UUID.randomUUID();
    private final UUID tutorProfileId = UUID.randomUUID();
    private final UUID studentUserId = UUID.randomUUID();
    private final UUID parentUserId = UUID.randomUUID();
    private final UUID tutorUserId = UUID.randomUUID();
    private final UUID strangerUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        bookingRepository = mock(BookingRepository.class);
        studentProfileService = mock(StudentProfileService.class);
        parentProfileService = mock(ParentProfileService.class);
        tutorProfileService = mock(TutorProfileService.class);

        bookingService = new BookingServiceImpl(
                bookingRepository,
                mock(BookingStateMachine.class),
                tutorProfileService,
                studentProfileService,
                parentProfileService,
                mock(AvailabilityService.class),
                mock(AuditLogService.class),
                mock(ApplicationEventPublisher.class));

        StudentProfile student = new StudentProfile();
        student.setId(studentProfileId);
        student.setUserId(studentUserId);
        when(studentProfileService.getById(studentProfileId)).thenReturn(student);

        TutorProfile tutor = new TutorProfile();
        tutor.setId(tutorProfileId);
        tutor.setUserId(tutorUserId);
        when(tutorProfileService.getById(tutorProfileId)).thenReturn(tutor);
    }

    private void bookingWithParent(UUID parentId) {
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStudentId(studentProfileId);
        booking.setTutorId(tutorProfileId);
        booking.setParentId(parentId);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
    }

    @Test
    void studentThemselves_isAParticipant() {
        bookingWithParent(null);
        assertThat(bookingService.isParticipant(bookingId, studentUserId)).isTrue();
    }

    @Test
    void theTutor_isAParticipant() {
        bookingWithParent(null);
        assertThat(bookingService.isParticipant(bookingId, tutorUserId)).isTrue();
    }

    @Test
    void theManagingParent_isAParticipantWhenTheBookingWasMadeOnBehalfOfAChild() {
        bookingWithParent(parentProfileId);
        ParentProfile parent = new ParentProfile();
        parent.setId(parentProfileId);
        parent.setUserId(parentUserId);
        when(parentProfileService.getById(parentProfileId)).thenReturn(parent);

        assertThat(bookingService.isParticipant(bookingId, parentUserId)).isTrue();
    }

    @Test
    void aStranger_isNeverAParticipant() {
        bookingWithParent(null);
        assertThat(bookingService.isParticipant(bookingId, strangerUserId)).isFalse();
    }

    @Test
    void whenBookedByAParent_theSelfRegisteredStudentAccountAloneIsNotEnoughToImplyTheParent() {
        // Guards against a subtle bug: if the booking has a parentId, a stranger with
        // no relation to that parent still shouldn't pass just by coincidentally being
        // the student's own userId check - this asserts the parent path is exercised too.
        bookingWithParent(parentProfileId);
        ParentProfile parent = new ParentProfile();
        parent.setId(parentProfileId);
        parent.setUserId(parentUserId);
        when(parentProfileService.getById(parentProfileId)).thenReturn(parent);

        assertThat(bookingService.isParticipant(bookingId, strangerUserId)).isFalse();
    }
}
