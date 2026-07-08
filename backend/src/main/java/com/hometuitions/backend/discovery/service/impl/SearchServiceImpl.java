package com.hometuitions.backend.discovery.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hometuitions.backend.discovery.dto.TutorSearchRequest;
import com.hometuitions.backend.discovery.dto.TutorSearchResult;
import com.hometuitions.backend.discovery.service.SearchService;
import com.hometuitions.backend.user.service.TutorProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

/**
 * Caches search results for 60s per docs/phase2/02-high-level-design.md  3 ("short TTL
 * because availability changes") - keyed by a coarse location bucket (~1.1km grid, not
 * exact coordinates) plus the filter set, so nearby searchers share a cache entry instead
 * of each exact lat/lng producing its own miss.
 */
@Service
public class SearchServiceImpl implements SearchService {

    private static final Duration CACHE_TTL = Duration.ofSeconds(60);

    private final TutorProfileService tutorProfileService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public SearchServiceImpl(TutorProfileService tutorProfileService,
                              StringRedisTemplate redisTemplate,
                              ObjectMapper objectMapper) {
        this.tutorProfileService = tutorProfileService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public Page<TutorSearchResult> search(TutorSearchRequest request) {
        String cacheKey = buildCacheKey(request);
        CachedSearchPage cached = readCache(cacheKey);
        if (cached != null) {
            return new PageImpl<>(cached.content(),
                    PageRequest.of(request.pageOrDefault(), request.sizeOrDefault()), cached.totalElements());
        }

        var pageable = PageRequest.of(request.pageOrDefault(), request.sizeOrDefault());
        var projections = tutorProfileService.searchNearby(
                request.lat(), request.lng(), request.radiusMetersOrDefault(),
                request.subject(), request.mode(),
                request.minPrice(), request.maxPrice(), request.minRating(), pageable);

        List<TutorSearchResult> results = projections.getContent().stream()
                .map(TutorSearchResult::from)
                .toList();

        writeCache(cacheKey, new CachedSearchPage(results, projections.getTotalElements()));

        return new PageImpl<>(results, pageable, projections.getTotalElements());
    }

    private String buildCacheKey(TutorSearchRequest request) {
        // ~2 decimal places ≈ 1.1km grid at the equator - coarse enough to bucket nearby
        // searchers together, precise enough not to blur distinct neighborhoods.
        double bucketedLat = Math.round(request.lat() * 100) / 100.0;
        double bucketedLng = Math.round(request.lng() * 100) / 100.0;

        return "search:tutors:%s:%s:%s:%s:%s:%s:%s:%s:%d:%d".formatted(
                bucketedLat, bucketedLng, request.radiusKm(),
                request.subject(), request.mode(),
                request.minPrice(), request.maxPrice(), request.minRating(),
                request.pageOrDefault(), request.sizeOrDefault());
    }

    private CachedSearchPage readCache(String key) {
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, CachedSearchPage.class);
        } catch (Exception e) {
            return null; // corrupt/incompatible cache entry - fall through to a fresh query
        }
    }

    private void writeCache(String key, CachedSearchPage page) {
        try {
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(page), CACHE_TTL);
        } catch (Exception e) {
            // caching is an optimization, not a correctness requirement - a write failure
            // here must never fail the search request itself
        }
    }
}
