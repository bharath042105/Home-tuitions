package com.hometuitions.backend.booking.integration;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.repository.BookingRepository;
import io.hypersistence.utils.hibernate.type.range.Range;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The single most important integrity guarantee in the schema
 * (docs/phase2/03-low-level-design.md  1 / docs/phase2/05-database-schema.md): the
 * `no_overlapping_confirmed_bookings` exclusion constraint is what makes double-booking
 * a database-enforced fact rather than an application promise that a race condition
 * (two instances accepting overlapping requests at once) could violate. Every other
 * test in this codebase mocks the repository layer - this one deliberately runs against
 * a real Postgres (with the same postgis/btree_gist extensions as production) via
 * Testcontainers, because a Mockito mock cannot exercise a database-level constraint.
 *
 * Requires Docker to be available wherever this test runs (local dev with Docker
 * Desktop, or CI with Docker-in-Docker) - it will not run in an environment without a
 * container runtime. Uses @DataJpaTest + AutoConfigureTestDatabase(NONE) so Flyway
 * migrates the real schema onto the container instead of an embedded database.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class BookingExclusionConstraintIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgis/postgis:15-3.4-alpine")
            .withDatabaseName("hometuitions_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void registerDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private BookingRepository bookingRepository;

    private Booking confirmedBooking(UUID tutorId, UUID studentId, OffsetDateTime start, OffsetDateTime end) {
        Booking booking = new Booking();
        booking.setTutorId(tutorId);
        booking.setStudentId(studentId);
        booking.setSubject("Algebra");
        booking.setMode(Booking.Mode.OFFLINE);
        booking.setTimeRange(Range.closedOpen(start, end));
        booking.setStatus(BookingStatus.CONFIRMED);
        return booking;
    }

    @Test
    void rejectsASecondConfirmedBookingOverlappingTheSameTutorsExistingSlot() {
        UUID tutorId = UUID.randomUUID();
        OffsetDateTime start = OffsetDateTime.now().plusDays(1).withHour(10).withMinute(0);
        OffsetDateTime end = start.plusHours(1);

        bookingRepository.saveAndFlush(confirmedBooking(tutorId, UUID.randomUUID(), start, end));

        // Overlaps the first booking by 30 minutes, same tutor - must be rejected at the
        // database level even though both rows would be perfectly valid individually.
        Booking overlapping = confirmedBooking(tutorId, UUID.randomUUID(), start.plusMinutes(30), end.plusMinutes(30));

        assertThatThrownBy(() -> bookingRepository.saveAndFlush(overlapping))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void allowsTwoConfirmedBookingsForTheSameTutorWhenTimesDoNotOverlap() {
        UUID tutorId = UUID.randomUUID();
        OffsetDateTime start = OffsetDateTime.now().plusDays(2).withHour(10).withMinute(0);
        OffsetDateTime end = start.plusHours(1);

        bookingRepository.saveAndFlush(confirmedBooking(tutorId, UUID.randomUUID(), start, end));

        // Starts exactly when the first one ends - back-to-back, not overlapping.
        Booking backToBack = confirmedBooking(tutorId, UUID.randomUUID(), end, end.plusHours(1));

        bookingRepository.saveAndFlush(backToBack); // must not throw
    }

    @Test
    void allowsOverlappingBookingsForDifferentTutors() {
        OffsetDateTime start = OffsetDateTime.now().plusDays(3).withHour(10).withMinute(0);
        OffsetDateTime end = start.plusHours(1);

        bookingRepository.saveAndFlush(confirmedBooking(UUID.randomUUID(), UUID.randomUUID(), start, end));
        // Same time window, but a different tutor_id - the exclusion constraint's
        // `tutor_id WITH =` clause means this must be allowed.
        bookingRepository.saveAndFlush(confirmedBooking(UUID.randomUUID(), UUID.randomUUID(), start, end));
    }
}
