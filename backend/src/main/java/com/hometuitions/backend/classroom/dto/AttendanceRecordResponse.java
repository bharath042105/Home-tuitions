package com.hometuitions.backend.classroom.dto;

import com.hometuitions.backend.classroom.entity.AttendanceRecord;

import java.time.Instant;
import java.util.UUID;

public record AttendanceRecordResponse(UUID id, UUID markedBy, AttendanceRecord.Status status, Instant markedAt) {
    public static AttendanceRecordResponse from(AttendanceRecord record) {
        return new AttendanceRecordResponse(record.getId(), record.getMarkedBy(), record.getStatus(), record.getMarkedAt());
    }
}
