package com.hometuitions.backend.booking.controller;

import com.hometuitions.backend.booking.dto.BookingResponse;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.service.BookingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@Tag(name = "Admin - Bookings")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<BookingResponse> list(@RequestParam(required = false) BookingStatus status) {
        return bookingService.listAll(status).stream().map(BookingResponse::from).toList();
    }
}
