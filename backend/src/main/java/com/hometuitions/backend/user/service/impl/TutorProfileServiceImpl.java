package com.hometuitions.backend.user.service.impl;

import com.hometuitions.backend.user.dto.TutorProfileRequest;
import com.hometuitions.backend.user.dto.TutorSearchProjection;
import com.hometuitions.backend.user.entity.TutorProfile;
import com.hometuitions.backend.user.repository.TutorProfileRepository;
import com.hometuitions.backend.user.service.TutorProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class TutorProfileServiceImpl implements TutorProfileService {

    private final TutorProfileRepository repository;

    public TutorProfileServiceImpl(TutorProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public TutorProfile createOrUpdate(UUID userId, TutorProfileRequest request) {
        TutorProfile profile = repository.findByUserId(userId).orElseGet(() -> {
            TutorProfile fresh = new TutorProfile();
            fresh.setUserId(userId);
            return fresh;
        });

        profile.setDisplayName(request.displayName());
        profile.setBio(request.bio());
        profile.setSubjects(request.subjects());
        profile.setHourlyRate(request.hourlyRate());
        profile.setTeachingMode(request.teachingMode());
        if (request.serviceRadiusKm() != null) {
            profile.setServiceRadiusKm(request.serviceRadiusKm());
        }
        profile.setUpdatedAt(Instant.now());

        TutorProfile saved = repository.save(profile);

        // base_location isn't a mapped JPA field (see entity comment), so it's written
        // via a separate native update rather than through the entity save above - must
        // run after save() so a brand-new profile already has a row for the UPDATE to hit.
        if (request.latitude() != null && request.longitude() != null) {
            repository.updateLocation(saved.getId(), request.latitude(), request.longitude());
        }

        return saved;
    }

    @Override
    public TutorProfile getByUserId(UUID userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("No tutor profile for this user yet"));
    }

    @Override
    public TutorProfile getById(UUID tutorProfileId) {
        return repository.findById(tutorProfileId)
                .orElseThrow(() -> new EntityNotFoundException("Tutor profile not found"));
    }

    @Override
    public void markSubmittedForVerification(UUID tutorProfileId) {
        TutorProfile profile = getById(tutorProfileId);
        if (profile.getVerificationStatus() == TutorProfile.VerificationStatus.NOT_SUBMITTED
                || profile.getVerificationStatus() == TutorProfile.VerificationStatus.REJECTED) {
            profile.setVerificationStatus(TutorProfile.VerificationStatus.SUBMITTED);
            profile.setUpdatedAt(Instant.now());
            repository.save(profile);
        }
    }

    @Override
    public void applyVerificationDecision(UUID tutorProfileId, TutorProfile.VerificationStatus decision) {
        TutorProfile profile = getById(tutorProfileId);
        profile.setVerificationStatus(decision);
        profile.setUpdatedAt(Instant.now());
        repository.save(profile);
    }

    @Override
    public Page<TutorSearchProjection> searchNearby(double lat, double lng, double radiusMeters,
                                                      String subject, String mode,
                                                      BigDecimal minPrice, BigDecimal maxPrice,
                                                      BigDecimal minRating, Pageable pageable) {
        return repository.searchNearby(lat, lng, radiusMeters, subject, mode, minPrice, maxPrice, minRating, pageable);
    }
}
