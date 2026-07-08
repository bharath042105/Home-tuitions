package com.hometuitions.backend.discovery.service.impl;

import com.hometuitions.backend.discovery.dto.TutorSearchResult;

import java.io.Serializable;
import java.util.List;

/**
 * Redis cache value shape - deliberately not Spring Data's Page/PageImpl, which has
 * known Jackson (de)serialization quirks for generic-typed content; a plain record
 * round-trips cleanly and is reconstructed into a PageImpl by the caller.
 */
public record CachedSearchPage(List<TutorSearchResult> content, long totalElements) implements Serializable {
}
