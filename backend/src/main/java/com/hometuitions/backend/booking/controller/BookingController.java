package com.hometuitions.backend.booking.controller;

import com.hometuitions.backend.booking.dto.BookingResponse;
import com.hometuitions.backend.booking.dto.CreateBookingRequest;
import com.hometuitions.backend.booking.dto.RespondToBookingRequest;
import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.user.entity.StudentProfile;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import com.hometuitions.backend.user.service.TutorProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings")
public class BookingController {

    private final BookingService bookingService;
    private final StudentProfileService studentProfileService;
    private final ParentProfileService parentProfileService;
    private final TutorProfileService tutorProfileService;

    public BookingController(BookingService bookingService,
                              StudentProfileService studentProfileService,
                              ParentProfileService parentProfileService,
                              TutorProfileService tutorProfileService) {
        this.bookingService = bookingService;
        this.studentProfileService = studentProfileService;
        this.parentProfileService = parentProfileService;
        this.tutorProfileService = tutorProfileService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(Authentication authentication,
                                                   @Valid @RequestBody CreateBookingRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        UUID studentProfileId;
        UUID parentProfileId;

        if (hasRole(authentication, "STUDENT")) {
            studentProfileId = studentProfileService.getByUserId(userId).getId();
            parentProfileId = null;
        } else if (hasRole(authentication, "PARENT")) {
            if (request.studentProfileId() == null) {
                throw new IllegalArgumentException("studentProfileId is required when booking as a parent");
            }
            parentProfileService.verifyOwnsChild(userId, request.studentProfileId());
            studentProfileId = request.studentProfileId();
            parentProfileId = parentProfileService.getByUserId(userId).getId();
        } else {
            throw new AccessDeniedException("Only students and parents can request bookings");
        }

        Booking booking = bookingService.createRequest(
                studentProfileId, parentProfileId, request.tutorId(),
                request.subject(), request.startTime(), request.endTime(), request.mode());
        return ResponseEntity.status(HttpStatus.CREATED).body(BookingResponse.from(booking));
    }

    @GetMapping("/me")
    public List<BookingResponse> listMine(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<Booking> bookings;

        if (hasRole(authentication, "STUDENT")) {
            UUID studentProfileId = studentProfileService.getByUserId(userId).getId();
            bookings = bookingService.listForStudent(studentProfileId);
        } else if (hasRole(authentication, "PARENT")) {
            List<UUID> childIds = parentProfileService.listChildren(userId).stream()
                    .map(StudentProfile::getId)
                    .toList();
            bookings = bookingService.listForStudents(childIds);
        } else if (hasRole(authentication, "TUTOR")) {
            UUID tutorProfileId = tutorProfileService.getByUserId(userId).getId();
            bookings = bookingService.listForTutor(tutorProfileId);
        } else {
            throw new AccessDeniedException("This role has no bookings view");
        }

        return bookings.stream().map(BookingResponse::from).toList();
    }

    @PostMapping("/{id}/respond")
    public BookingResponse respond(Authentication authentication,
                                    @PathVariable UUID id,
                                    @Valid @RequestBody RespondToBookingRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        UUID tutorProfileId = tutorProfileService.getByUserId(userId).getId();
        var booking = bookingService.respond(id, tutorProfileId, request.action(), authentication.getName());
        return BookingResponse.from(booking);
    }

    @PostMapping("/{id}/cancel")
    public BookingResponse cancel(Authentication authentication, @PathVariable UUID id) {
        var booking = bookingService.cancel(id, authentication.getName());
        return BookingResponse.from(booking);
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}
