package com.hometuitions.backend.user.service;

import com.hometuitions.backend.user.dto.StudentProfileRequest;
import com.hometuitions.backend.user.entity.StudentProfile;

import java.util.List;
import java.util.UUID;

public interface StudentProfileService {
    StudentProfile createOrUpdate(UUID userId, StudentProfileRequest request);
    StudentProfile getByUserId(UUID userId);
    StudentProfile getById(UUID studentProfileId);
    List<StudentProfile> getByIds(List<UUID> studentProfileIds);

    /** Parent-added child sub-profile with no login of its own (userId = null). */
    StudentProfile createManagedByParent(StudentProfileRequest request);

    /** Updates a parent-managed child's profile fields. Callers must verify the
     *  calling parent actually owns this child via ParentStudentLink first - this
     *  method does not check ownership itself, since it doesn't know about parents. */
    StudentProfile updateManagedProfile(UUID studentProfileId, StudentProfileRequest request);
}
