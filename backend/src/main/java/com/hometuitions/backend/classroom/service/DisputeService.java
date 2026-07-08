package com.hometuitions.backend.classroom.service;

import com.hometuitions.backend.classroom.entity.Dispute;

import java.util.List;
import java.util.UUID;

public interface DisputeService {

    Dispute create(UUID bookingId, String reason);

    List<Dispute> listOpen();

    /** Admin-facing (SRS FR-11.3): resolves a dispute by deciding the outcome and
     *  driving the corresponding BookingService transition - completing the session (and
     *  releasing payment) or treating it as a mutual cancellation (and refunding). */
    Dispute resolve(UUID bookingId, UUID adminUserId, Resolution resolution, String note);

    enum Resolution { COMPLETE_AND_PAY, CANCEL_AND_REFUND }
}
