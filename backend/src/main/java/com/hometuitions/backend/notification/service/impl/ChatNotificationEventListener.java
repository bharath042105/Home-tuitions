package com.hometuitions.backend.notification.service.impl;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.chat.event.ChatMessageSentEvent;
import com.hometuitions.backend.notification.service.NotificationService;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import com.hometuitions.backend.user.service.TutorProfileService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class ChatNotificationEventListener {

    private static final int PREVIEW_LENGTH = 80;

    private final NotificationService notificationService;
    private final BookingService bookingService;
    private final TutorProfileService tutorProfileService;
    private final StudentProfileService studentProfileService;
    private final ParentProfileService parentProfileService;

    public ChatNotificationEventListener(NotificationService notificationService,
                                          BookingService bookingService,
                                          TutorProfileService tutorProfileService,
                                          StudentProfileService studentProfileService,
                                          ParentProfileService parentProfileService) {
        this.notificationService = notificationService;
        this.bookingService = bookingService;
        this.tutorProfileService = tutorProfileService;
        this.studentProfileService = studentProfileService;
        this.parentProfileService = parentProfileService;
    }

    @EventListener
    public void onChatMessageSent(ChatMessageSentEvent event) {
        Booking booking = bookingService.getById(event.bookingId());

        List<UUID> participantUserIds = new ArrayList<>();
        participantUserIds.add(tutorProfileService.getById(booking.getTutorId()).getUserId());
        if (booking.getParentId() != null) {
            participantUserIds.add(parentProfileService.getById(booking.getParentId()).getUserId());
        } else {
            participantUserIds.add(studentProfileService.getById(booking.getStudentId()).getUserId());
        }

        String preview = event.body().length() > PREVIEW_LENGTH
                ? event.body().substring(0, PREVIEW_LENGTH) + "..."
                : event.body();

        participantUserIds.stream()
                .filter(userId -> !userId.equals(event.senderId()))
                .forEach(recipientUserId -> notificationService.notify(
                        recipientUserId, "NEW_MESSAGE", "New message", preview,
                        Map.of("bookingId", event.bookingId().toString())));
    }
}
