package com.hometuitions.backend.discovery.service;

import com.hometuitions.backend.discovery.dto.TutorSearchRequest;
import com.hometuitions.backend.discovery.dto.TutorSearchResult;
import org.springframework.data.domain.Page;

public interface SearchService {
    Page<TutorSearchResult> search(TutorSearchRequest request);
}
