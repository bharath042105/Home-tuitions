package com.hometuitions.backend.classroom.controller;

import com.hometuitions.backend.classroom.dto.AttendanceRecordResponse;
import com.hometuitions.backend.classroom.dto.MarkAttendanceRequest;
import com.hometuitions.backend.classroom.service.AttendanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings/{bookingId}/attendance")
@Tag(name = "Attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<AttendanceRecordResponse> list(Authentication authentication, @PathVariable UUID bookingId) {
        UUID userId = UUID.fromString(authentication.getName());
        return attendanceService.listForBooking(bookingId, userId).stream()
                .map(AttendanceRecordResponse::from)
                .toList();
    }

    @PostMapping
    public AttendanceRecordResponse mark(Authentication authentication,
                                          @PathVariable UUID bookingId,
                                          @Valid @RequestBody MarkAttendanceRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        var record = attendanceService.markAttendance(bookingId, userId, request.status());
        return AttendanceRecordResponse.from(record);
    }
}
