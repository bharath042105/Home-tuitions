package com.hometuitions.backend.user.service.impl;

import com.hometuitions.backend.user.dto.StudentProfileRequest;
import com.hometuitions.backend.user.entity.StudentProfile;
import com.hometuitions.backend.user.repository.StudentProfileRepository;
import com.hometuitions.backend.user.service.StudentProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository repository;

    public StudentProfileServiceImpl(StudentProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public StudentProfile createOrUpdate(UUID userId, StudentProfileRequest request) {
        StudentProfile profile = repository.findByUserId(userId).orElseGet(() -> {
            StudentProfile fresh = new StudentProfile();
            fresh.setUserId(userId);
            return fresh;
        });

        applyRequest(profile, request);
        return repository.save(profile);
    }

    @Override
    public StudentProfile getByUserId(UUID userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("No student profile for this user yet"));
    }

    @Override
    public StudentProfile getById(UUID studentProfileId) {
        return repository.findById(studentProfileId)
                .orElseThrow(() -> new EntityNotFoundException("Student profile not found"));
    }

    @Override
    public List<StudentProfile> getByIds(List<UUID> studentProfileIds) {
        return repository.findAllById(studentProfileIds);
    }

    @Override
    public StudentProfile createManagedByParent(StudentProfileRequest request) {
        StudentProfile profile = new StudentProfile(); // userId left null - no login of its own
        applyRequest(profile, request);
        return repository.save(profile);
    }

    @Override
    public StudentProfile updateManagedProfile(UUID studentProfileId, StudentProfileRequest request) {
        StudentProfile profile = getById(studentProfileId);
        applyRequest(profile, request);
        return repository.save(profile);
    }

    private void applyRequest(StudentProfile profile, StudentProfileRequest request) {
        profile.setDisplayName(request.displayName());
        profile.setGrade(request.grade());
        profile.setSubjectsOfInterest(request.subjectsOfInterest());
        profile.setCity(request.city());
    }
}
