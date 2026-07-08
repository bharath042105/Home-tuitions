package com.hometuitions.backend.user.service;

import com.hometuitions.backend.user.dto.ParentProfileRequest;
import com.hometuitions.backend.user.dto.StudentProfileRequest;
import com.hometuitions.backend.user.entity.ParentProfile;
import com.hometuitions.backend.user.entity.StudentProfile;

import java.util.List;
import java.util.UUID;

public interface ParentProfileService {

    ParentProfile createOrUpdate(UUID userId, ParentProfileRequest request);

    ParentProfile getByUserId(UUID userId);

    /** Public-facing lookup by profile id (not userId) - used by the booking module to
     *  resolve whose user account a booking's parentId belongs to. */
    ParentProfile getById(UUID parentProfileId);

    /** Throws AccessDeniedException if this parent has no link to the given student. Exposed
     *  so other modules (booking) can reuse the same ownership check updateChild() already
     *  performs, rather than re-querying ParentStudentLinkRepository themselves. */
    void verifyOwnsChild(UUID parentUserId, UUID studentProfileId);

    /** Creates a child sub-profile (no login of its own) and links it to this parent. */
    StudentProfile addChild(UUID parentUserId, StudentProfileRequest request);

    List<StudentProfile> listChildren(UUID parentUserId);

    /** Throws if this parent has no link to the given student profile - prevents a
     *  parent from editing another parent's child by guessing an id. */
    StudentProfile updateChild(UUID parentUserId, UUID studentProfileId, StudentProfileRequest request);
}
