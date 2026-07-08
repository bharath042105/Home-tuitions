package com.hometuitions.backend.user.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Native-query projection for tutor search results. `subjects` comes back as a
 * comma-joined string (`array_to_string`) rather than a Postgres array, since
 * Spring Data's interface projections don't reliably convert java.sql.Array for
 * native queries - simpler to join in SQL and split in the mapper than to fight
 * JDBC array typing for a field that's just displayed, never computed on.
 *
 * Lives in `dto`, not `repository`, so TutorProfileService can expose it to other
 * modules (discovery) without leaking a repository-package type across the
 * module boundary.
 */
public interface TutorSearchProjection {
    UUID getId();
    String getDisplayName();
    String getBio();
    String getSubjectsCsv();
    BigDecimal getHourlyRate();
    String getTeachingMode();
    BigDecimal getAvgRating();
    Integer getReviewCount();
    Double getDistanceKm();
}
