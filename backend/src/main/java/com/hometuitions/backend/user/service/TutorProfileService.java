package com.hometuitions.backend.user.service;

import com.hometuitions.backend.user.dto.TutorProfileRequest;
import com.hometuitions.backend.user.dto.TutorSearchProjection;
import com.hometuitions.backend.user.entity.TutorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Public entry point other modules use to read tutor data - discovery, booking,
 * review, and admin should all depend on this interface, never TutorProfileRepository
 * directly (module-boundary rule, docs/phase2/02-high-level-design.md).
 */
public interface TutorProfileService {

    TutorProfile createOrUpdate(UUID userId, TutorProfileRequest request);

    TutorProfile getByUserId(UUID userId);

    /** Public-facing lookup by profile id (not userId) - used by tutor discovery/detail pages. */
    TutorProfile getById(UUID tutorProfileId);

    /** Called by the verification module once a tutor submits their first document set.
     *  Takes the TutorProfile id (not User id) - verification only ever knows tutors by
     *  that id, via TutorDocument.tutorId. */
    void markSubmittedForVerification(UUID tutorProfileId);

    /** Called by the verification module (via admin decision) once approved/rejected. */
    void applyVerificationDecision(UUID tutorProfileId, TutorProfile.VerificationStatus decision);

    /** Called by the discovery module - kept here rather than exposing TutorProfileRepository
     *  directly, per the module-boundary rule. */
    Page<TutorSearchProjection> searchNearby(double lat, double lng, double radiusMeters,
                                              String subject, String mode,
                                              BigDecimal minPrice, BigDecimal maxPrice,
                                              BigDecimal minRating, Pageable pageable);
}
