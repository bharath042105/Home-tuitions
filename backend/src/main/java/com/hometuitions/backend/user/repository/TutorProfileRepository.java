package com.hometuitions.backend.user.repository;

import com.hometuitions.backend.user.dto.TutorSearchProjection;
import com.hometuitions.backend.user.entity.TutorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface TutorProfileRepository extends JpaRepository<TutorProfile, UUID> {
    Optional<TutorProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);

    /**
     * base_location (PostGIS geography) is intentionally not JPA-mapped (see the
     * entity's comment) - this is the one write path that touches it, via raw SQL,
     * rather than pulling in hibernate-spatial for a single column.
     */
    @Modifying
    @Query(value = "UPDATE tutor_profiles SET base_location = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography WHERE id = :id",
            nativeQuery = true)
    void updateLocation(@Param("id") UUID id, @Param("lat") double lat, @Param("lng") double lng);

    /**
     * Nearby search: ST_DWithin uses the base_location GIST index (docs/phase2/05-database-schema.md),
     * so this is an index scan, not a full table scan, even at scale. Each filter is
     * `(:param IS NULL OR ...)` so the caller can omit any of them. Only VERIFIED tutors
     * are ever returned - unverified tutors must never be discoverable (SRS FR-3).
     */
    @Query(value = """
            SELECT t.id AS id,
                   t.display_name AS displayName,
                   t.bio AS bio,
                   array_to_string(t.subjects, ',') AS subjectsCsv,
                   t.hourly_rate AS hourlyRate,
                   t.teaching_mode AS teachingMode,
                   t.avg_rating AS avgRating,
                   t.review_count AS reviewCount,
                   ST_Distance(t.base_location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) / 1000.0 AS distanceKm
            FROM tutor_profiles t
            WHERE t.verification_status = 'VERIFIED'
              AND t.base_location IS NOT NULL
              AND ST_DWithin(t.base_location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)
              AND (:subject IS NULL OR :subject = ANY(t.subjects))
              AND (:mode IS NULL OR t.teaching_mode = :mode OR t.teaching_mode = 'BOTH')
              AND (:minPrice IS NULL OR t.hourly_rate >= :minPrice)
              AND (:maxPrice IS NULL OR t.hourly_rate <= :maxPrice)
              AND (:minRating IS NULL OR t.avg_rating >= :minRating)
            ORDER BY distanceKm ASC
            """,
            countQuery = """
            SELECT count(*)
            FROM tutor_profiles t
            WHERE t.verification_status = 'VERIFIED'
              AND t.base_location IS NOT NULL
              AND ST_DWithin(t.base_location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)
              AND (:subject IS NULL OR :subject = ANY(t.subjects))
              AND (:mode IS NULL OR t.teaching_mode = :mode OR t.teaching_mode = 'BOTH')
              AND (:minPrice IS NULL OR t.hourly_rate >= :minPrice)
              AND (:maxPrice IS NULL OR t.hourly_rate <= :maxPrice)
              AND (:minRating IS NULL OR t.avg_rating >= :minRating)
            """,
            nativeQuery = true)
    Page<TutorSearchProjection> searchNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters,
            @Param("subject") String subject,
            @Param("mode") String mode,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            Pageable pageable);
}
