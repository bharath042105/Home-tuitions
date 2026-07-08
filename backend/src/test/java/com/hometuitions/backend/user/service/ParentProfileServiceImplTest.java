package com.hometuitions.backend.user.service;

import com.hometuitions.backend.user.dto.StudentProfileRequest;
import com.hometuitions.backend.user.entity.ParentProfile;
import com.hometuitions.backend.user.entity.ParentStudentLink;
import com.hometuitions.backend.user.repository.ParentProfileRepository;
import com.hometuitions.backend.user.repository.ParentStudentLinkRepository;
import com.hometuitions.backend.user.service.impl.ParentProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * verifyOwnsChild() is the one check standing between a parent and editing/booking for
 * a child that isn't theirs (an IDOR risk if it's ever skipped or gets the ownership
 * direction backwards) - worth a direct test independent of whichever caller
 * (updateChild, or the booking module reusing it) happens to invoke it.
 */
class ParentProfileServiceImplTest {

    private ParentProfileRepository parentRepository;
    private ParentStudentLinkRepository linkRepository;
    private ParentProfileServiceImpl parentProfileService;

    private final UUID parentUserId = UUID.randomUUID();
    private final UUID parentProfileId = UUID.randomUUID();
    private final UUID ownChildId = UUID.randomUUID();
    private final UUID someoneElsesChildId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        parentRepository = mock(ParentProfileRepository.class);
        linkRepository = mock(ParentStudentLinkRepository.class);
        StudentProfileService studentProfileService = mock(StudentProfileService.class);

        parentProfileService = new ParentProfileServiceImpl(parentRepository, linkRepository, studentProfileService);

        ParentProfile parent = new ParentProfile();
        parent.setId(parentProfileId);
        parent.setUserId(parentUserId);
        when(parentRepository.findByUserId(parentUserId)).thenReturn(Optional.of(parent));

        when(linkRepository.findByParentIdAndStudentId(parentProfileId, ownChildId))
                .thenReturn(Optional.of(new ParentStudentLink()));
        when(linkRepository.findByParentIdAndStudentId(parentProfileId, someoneElsesChildId))
                .thenReturn(Optional.empty());
    }

    @Test
    void allowsAParentToActOnTheirOwnChild() {
        assertThatCode(() -> parentProfileService.verifyOwnsChild(parentUserId, ownChildId))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsAParentActingOnAChildTheyDontOwn() {
        assertThatThrownBy(() -> parentProfileService.verifyOwnsChild(parentUserId, someoneElsesChildId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void updateChild_isBlockedForAnUnlinkedChildBeforeTouchingTheStudentProfile() {
        StudentProfileRequest request = new StudentProfileRequest("New Name", null, null, null);

        assertThatThrownBy(() -> parentProfileService.updateChild(parentUserId, someoneElsesChildId, request))
                .isInstanceOf(AccessDeniedException.class);
    }
}
