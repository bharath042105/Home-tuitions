package com.hometuitions.backend.user.service.impl;

import com.hometuitions.backend.user.dto.ParentProfileRequest;
import com.hometuitions.backend.user.dto.StudentProfileRequest;
import com.hometuitions.backend.user.entity.ParentProfile;
import com.hometuitions.backend.user.entity.ParentStudentLink;
import com.hometuitions.backend.user.entity.StudentProfile;
import com.hometuitions.backend.user.repository.ParentProfileRepository;
import com.hometuitions.backend.user.repository.ParentStudentLinkRepository;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ParentProfileServiceImpl implements ParentProfileService {

    private final ParentProfileRepository parentRepository;
    private final ParentStudentLinkRepository linkRepository;
    private final StudentProfileService studentProfileService;

    public ParentProfileServiceImpl(ParentProfileRepository parentRepository,
                                     ParentStudentLinkRepository linkRepository,
                                     StudentProfileService studentProfileService) {
        this.parentRepository = parentRepository;
        this.linkRepository = linkRepository;
        this.studentProfileService = studentProfileService;
    }

    @Override
    public ParentProfile createOrUpdate(UUID userId, ParentProfileRequest request) {
        ParentProfile profile = parentRepository.findByUserId(userId).orElseGet(() -> {
            ParentProfile fresh = new ParentProfile();
            fresh.setUserId(userId);
            return fresh;
        });
        profile.setDisplayName(request.displayName());
        return parentRepository.save(profile);
    }

    @Override
    public ParentProfile getByUserId(UUID userId) {
        return parentRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("No parent profile for this user yet"));
    }

    @Override
    public StudentProfile addChild(UUID parentUserId, StudentProfileRequest request) {
        ParentProfile parent = getByUserId(parentUserId);
        StudentProfile child = studentProfileService.createManagedByParent(request);

        ParentStudentLink link = new ParentStudentLink();
        link.setParentId(parent.getId());
        link.setStudentId(child.getId());
        linkRepository.save(link);

        return child;
    }

    @Override
    public List<StudentProfile> listChildren(UUID parentUserId) {
        ParentProfile parent = getByUserId(parentUserId);
        List<UUID> studentIds = linkRepository.findByParentId(parent.getId()).stream()
                .map(ParentStudentLink::getStudentId)
                .toList();
        return studentProfileService.getByIds(studentIds);
    }

    @Override
    public StudentProfile updateChild(UUID parentUserId, UUID studentProfileId, StudentProfileRequest request) {
        verifyOwnsChild(parentUserId, studentProfileId);
        return studentProfileService.updateManagedProfile(studentProfileId, request);
    }

    @Override
    public ParentProfile getById(UUID parentProfileId) {
        return parentRepository.findById(parentProfileId)
                .orElseThrow(() -> new EntityNotFoundException("Parent profile not found"));
    }

    @Override
    public void verifyOwnsChild(UUID parentUserId, UUID studentProfileId) {
        ParentProfile parent = getByUserId(parentUserId);
        linkRepository.findByParentIdAndStudentId(parent.getId(), studentProfileId)
                .orElseThrow(() -> new AccessDeniedException("This student is not linked to your account"));
    }
}
